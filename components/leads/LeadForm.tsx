"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Lead, leadSchema, MasterData } from "@/types";
import { leadService } from "@/services/leadService";
import { masterDataService } from "@/services/masterDataService";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useUsers } from "@/hooks/useUsers";

interface LeadFormProps {
  lead?: Lead;
  onSuccess: () => void;
}

// Fallback sources in case master data fails to load
const fallbackLeadSources = [
  "Website",
  "Referral",
  "Social Media",
  "Email Campaign",
  "Trade Show",
  "Cold Call",
  "Other",
];

// Fallback sales reps in case users fail to load

export function LeadForm({ lead, onSuccess }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [leadSources, setLeadSources] = useState<MasterData[]>([]);
  const [loadingLeadSources, setLoadingLeadSources] = useState(true);
  const { toast } = useToast();
  const { settings, loading: loadingSettings } = useSettings();
  const { users, loading: loadingUsers } = useUsers();
  
  // Filter users to only include sales reps and management
  const salesUsers = users?.filter(user => 
    user.role === 'sales-rep' || user.role === 'sales-mgr' || user.role === 'admin'
  ) || [];

  // Fetch lead sources from master data
  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        setLoadingLeadSources(true);
        const masterData = await masterDataService.getMasterDataByCategory('lead-sources');
        if (masterData && masterData.length > 0) {
          setLeadSources(masterData);
        } 
      } catch (error) {
        console.error("Error fetching lead sources:", error);
      } finally {
        setLoadingLeadSources(false);
      }
    };

    fetchLeadSources();
  }, []);

  const form = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: lead || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      source: "",
      status: "new",
      score: "warm",
      notes: "",
      assignedTo: undefined,
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Process form values before submission
      const processedValues = {...values};
      
      // Convert assignedTo object to just the ID for API
      if (processedValues.assignedTo && typeof processedValues.assignedTo === 'object') {
        processedValues.assignedTo = processedValues.assignedTo.id;
      }
      
      if (lead) {
        await leadService.updateLead(lead._id, processedValues);
        toast({
          title: "Lead Updated",
          description: "The lead has been updated successfully.",
        });
      } else {
        await leadService.createLead(processedValues);
        toast({
          title: "Lead Created",
          description: "The new lead has been created successfully.",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Lead Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h2>
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Source *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingLeadSources ? "Loading..." : "Select lead source"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leadSources.map((source) => (
                              <SelectItem key={source.id} value={source.id}>
                                {source.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Where did this lead come from?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Score *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lead score" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hot">Hot</SelectItem>
                            <SelectItem value="warm">Warm</SelectItem>
                            <SelectItem value="cold">Cold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          How qualified is this lead?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => {
                    // Calculate the correct value for the select component
                    const selectValue = typeof field.value === 'string' 
                      ? field.value 
                      : field.value?.id || "";
                      
                    return (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const selectedUser = salesUsers.find(user => user._id === value);
                          if (selectedUser) {
                            field.onChange({
                              id: selectedUser._id,
                              firstName: selectedUser.firstName,
                              lastName: selectedUser.lastName
                            });
                          } else {
                            field.onChange(undefined);
                          }
                        }} 
                        value={selectValue}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sales representative">
                              {field.value 
                                ? (typeof field.value === 'string'
                                    ? salesUsers.find(u => u._id === field.value)
                                      ? `${salesUsers.find(u => u._id === field.value)?.firstName || ''} ${salesUsers.find(u => u._id === field.value)?.lastName || ''}`
                                      : field.value
                                    : `${field.value.firstName} ${field.value.lastName}`)
                                : ""
                              }
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         {
                            salesUsers.map((user) => (
                              <SelectItem key={user._id} value={user._id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))
                        }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any relevant notes about the lead..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-lg">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onSuccess()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {lead ? "Update Lead" : "Create Lead"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}