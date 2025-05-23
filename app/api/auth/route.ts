import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/model/user';
import Tenant from '@/model/tenant';
import dbConnect from '@/lib/dbConnect';
import MasterDataModel from '@/model/masterData';
import { Console } from 'console';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(req: Request) {
    console.log('Request received');
    await dbConnect();
    console.log('Request received at /api/auth route');

    const requestBody = await req.json();

    if (requestBody.action === 'register') {

        const existingUser = await User.findOne({ email: requestBody.email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'A user with this email already exists' },
                { status: 409 }
            );
        }

        try {
            // Create tenant
            const tenantData = {
                companyName: requestBody.companyName,
            };
            const newTenant = new Tenant(tenantData);
            const savedTenant = await newTenant.save();

            try {
                // Create user
                const hashedPassword = await bcrypt.hash(requestBody.password, 10);

                // Split the name into firstName and lastName
                const nameParts = requestBody.name.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const userData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: requestBody.email,
                    password: hashedPassword,
                    tenantId: savedTenant._id,
                    role: 'admin', // Default role for the first user
                    status: 'active', // Default status for the first user
                };
                console.log('User data:', userData);
                const newUser = new User(userData);
                await newUser.save();

                var deals = ['qualification', 'meeting', 'proposal', 'negotiation', 'closing']

                const mockDealStages = Array.from({ length: deals.length }, (_, i) => ({
                    category: 'deal-stages',
                    name: deals[i],
                    value:deals[i],
                    displayOrder: i,
                    isActive: true,
                    tenantId: savedTenant._id,
                }));
                await MasterDataModel.insertMany(mockDealStages);

                const dealSource = ['event', 'other', 'referral', 'social-media', 'website'];
                const mockLeadSources = Array.from({ length: dealSource.length }, (_, i) => ({
                    category: 'lead-sources',
                    name: dealSource[i],
                    value: dealSource[i],
                    displayOrder: i,
                    isActive: true,
                    tenantId: savedTenant._id,
                }));
                
                await MasterDataModel.insertMany(mockLeadSources);

                // Update tenant to active
                await Tenant.updateOne(
                    { _id: savedTenant._id },
                    { $set: { status: 'active' } }
                );
                console.log('Tenant updated:', savedTenant._id);



                return NextResponse.json({ tenant: savedTenant, user: newUser });
            } catch (userError) {
                console.log('Tenant updated:', savedTenant._id);
                // If user creation fails, delete the tenant
                if (savedTenant?._id) {
                    await Tenant.deleteOne({ _id: savedTenant._id });
                }
                throw userError;
            }
        } catch (error) {
            console.error('Operation failed:', error);
            throw error;
        }

    }

    if (requestBody.action === 'login') {
        try {
            console.log('User logging');
            const user = await User.findOne({ email: requestBody.email });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const isPasswordValid = await bcrypt.compare(requestBody.password, user.password);
            console.log('isPasswordValid', isPasswordValid);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }

            const token = jwt.sign({ id: user._id, email: user.email, role: user.role, tenantId: user.tenantId }, JWT_SECRET, {
                expiresIn: '1d',
            });

            const response = NextResponse.json({ id: user._id, email: user.email, role: user.role, tenantId: user.tenantId, message: 'Login successful' });
            response.cookies.set('authToken', token, { httpOnly: true, path: '/', maxAge: 86400 });
            return response;
        } catch (error) {
            return NextResponse.json({ error: 'Error logging in' }, { status: 500 });
        }
    }
    console.log('Invalid action');

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}