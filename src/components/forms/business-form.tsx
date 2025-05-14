"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Textarea,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { generateSlug } from "@/lib/utils";
import type { Database } from "@/lib/supabase/client";
import {
  Monitor,
  Map,
  Smartphone,
  Mail,
  Phone,
  Globe,
  Pencil,
  Sparkles,
  Clock,
  Calendar,
  Utensils,
  Store,
  Briefcase,
  Settings,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  enhancedBusinessSchema,
  EnhancedBusinessFormData,
  createBusinessTypeSchema,
  transformFormToBusinessData,
} from "@/lib/schemas/business-form-schema";
import { BusinessType, DEFAULT_BUSINESS_SECTIONS } from "@/types/business";
import {
  SIMPLE_CATEGORIES,
  getSuggestedCategories,
  MAIN_CATEGORIES,
} from "@/lib/data/categories";
import * as Collapsible from "@radix-ui/react-collapsible";

interface BusinessFormProps {
  business?: Database["public"]["Tables"]["businesses"]["Row"];
}

export function BusinessForm({ business }: BusinessFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedType, setSelectedType] = useState<BusinessType>("service");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic"])
  );
  
  const logoFileRef = useRef<HTMLInputElement>(null);
  const imagesFileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();

  // Safe access to business properties with fallbacks
  const getBusinessValue = (key: string, fallback: any = null) => {
    if (!business) return fallback;
    
    // Handle nested properties
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      const parentValue = business[parent as keyof typeof business];
      if (parentValue && typeof parentValue === 'object' && parentValue !== null) {
        return (parentValue as any)[child] || fallback;
      }
      return fallback;
    }
    
    // Handle direct properties
    return business[key as keyof typeof business] || fallback;
  };

  // Initialize form with dynamic schema based on business type
  const form = useForm<EnhancedBusinessFormData>({
    resolver: zodResolver(createBusinessTypeSchema(selectedType)),
    defaultValues: {
      name: getBusinessValue('name', ''),
      business_type: getBusinessValue('business_type', 'service'),
      tagline: getBusinessValue('tagline', ''),
      description: getBusinessValue('description', ''),
      short_description: getBusinessValue('short_description', ''),
      category: getBusinessValue('category', ''),
      phone: getBusinessValue('phone', ''),
      whatsapp_enabled: false,
      email: getBusinessValue('email', ''),
      website: getBusinessValue('website', ''),
      address: getBusinessValue('address', ''),
      address_2: '', // This might not exist in current schema
      city: getBusinessValue('city', ''),
      state: getBusinessValue('state', ''),
      postal_code: getBusinessValue('postal_code', '') || getBusinessValue('zip_code', ''),
      country: getBusinessValue('country', 'India'),
      
      // Social media - safely access nested object
      facebook: getBusinessValue('social_media.facebook', ''),
      instagram: getBusinessValue('social_media.instagram', ''),
      twitter: getBusinessValue('social_media.twitter', ''),
      linkedin: getBusinessValue('social_media.linkedin', ''),
      youtube: getBusinessValue('social_media.youtube', ''),
      
      // Business hours - safely access nested object  
      mondayHours: getBusinessValue('business_hours.monday', '') || getBusinessValue('hours.monday', ''),
      tuesdayHours: getBusinessValue('business_hours.tuesday', '') || getBusinessValue('hours.tuesday', ''),
      wednesdayHours: getBusinessValue('business_hours.wednesday', '') || getBusinessValue('hours.wednesday', ''),
      thursdayHours: getBusinessValue('business_hours.thursday', '') || getBusinessValue('hours.thursday', ''),
      fridayHours: getBusinessValue('business_hours.friday', '') || getBusinessValue('hours.friday', ''),
      saturdayHours: getBusinessValue('business_hours.saturday', '') || getBusinessValue('hours.saturday', ''),
      sundayHours: getBusinessValue('business_hours.sunday', '') || getBusinessValue('hours.sunday', ''),
      
      // Additional fields
      tags: getBusinessValue('tags', []),
      amenities: getBusinessValue('amenities', []),
      payment_methods: getBusinessValue('payment_methods', []),
      languages_spoken: getBusinessValue('languages_spoken', []),
      
      // AI configuration
      ai_prompt: getBusinessValue('ai_prompt', ''),
      ai_agent_enabled: getBusinessValue('ai_agent_enabled', false),
      
      // Files
      logoFile: undefined,
      images: undefined,
    },
  });

  // Watch business type changes
  const watchedType = useWatch({
    control: form.control,
    name: "business_type",
  });

  const watchedValues = useWatch({
    control: form.control,
  });

  // Update selected type when form value changes
  useEffect(() => {
    if (watchedType && watchedType !== selectedType) {
      setSelectedType(watchedType);
      // Re-validate with new schema
      form.trigger();
    }
  }, [watchedType, selectedType, form]);

  // Business type configurations
  const businessTypeConfig = {
    service: {
      icon: Briefcase,
      label: "Service Business",
      description: "Professional services, consultations, repairs",
      examples: ["Plumbing", "Legal Services", "Consulting"],
      sections: ["services", "appointments", "reviews", "gallery"],
      recommendedFields: ["phone", "email", "business_hours", "service_area"],
    },
    store: {
      icon: Store,
      label: "Store/Retail",
      description: "Physical or online stores selling products",
      examples: ["Clothing Store", "Electronics", "Grocery"],
      sections: ["products", "reviews", "gallery", "delivery"],
      recommendedFields: ["address", "business_hours", "payment_methods"],
    },
    restaurant: {
      icon: Utensils,
      label: "Restaurant",
      description: "Restaurants, cafes, food services",
      examples: ["Restaurant", "Cafe", "Food Truck"],
      sections: ["menu", "table_booking", "reviews", "gallery"],
      recommendedFields: ["address", "phone", "business_hours", "delivery"],
    },
    professional: {
      icon: Briefcase,
      label: "Professional Services",
      description: "Healthcare, legal, financial services",
      examples: ["Doctor", "Lawyer", "Accountant"],
      sections: ["services", "appointments", "reviews", "staff"],
      recommendedFields: ["phone", "email", "credentials", "appointments"],
    },
  };

  // Handle file uploads
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      form.setValue("logoFile", files);
      if (files[0]) {
        const previewUrl = URL.createObjectURL(files[0]);
        setLogoPreview(previewUrl);
      }
    }
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      form.setValue("images", files);
      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImagesPreviews(previews);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Get suggested categories based on business type
  const suggestedCategories = getSuggestedCategories(selectedType);
  const allCategories = MAIN_CATEGORIES;

  // Form submission
  const onSubmit = async (data: EnhancedBusinessFormData) => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      // Transform form data to match database schema
      const businessData = transformFormToBusinessData(data);

      // Handle file uploads (simplified for now)
      let logoUrl = getBusinessValue('logo_url', null);
      let imageUrls: string[] = getBusinessValue('images', []);

      // Upload logo if provided
      if (data.logoFile && data.logoFile.length > 0) {
        const logoFile = data.logoFile[0];
        const logoPath = `${user.id}/logo-${Date.now()}-${logoFile.name}`;

        const { error: logoError } = await supabase.storage
          .from("business-media")
          .upload(logoPath, logoFile);

        if (logoError) throw logoError;

        const { data: logoPublic } = supabase.storage
          .from("business-media")
          .getPublicUrl(logoPath);

        logoUrl = logoPublic.publicUrl;
      }

      // Upload gallery images if provided
      if (data.images && data.images.length > 0) {
        const filesArray = Array.from(data.images);

        const uploadPromises = filesArray.map(async (file, index) => {
          const imagePath = `${user.id}/gallery-${Date.now()}-${index}-${file.name}`;

          const { error: imageError } = await supabase.storage
            .from("business-media")
            .upload(imagePath, file);

          if (imageError) throw imageError;

          const { data: imagePublic } = supabase.storage
            .from("business-media")
            .getPublicUrl(imagePath);

          return imagePublic.publicUrl;
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      const slug = getBusinessValue('slug', null) || generateSlug(data.name);

      const finalBusinessData = {
        ...businessData,
        owner_id: user.id,
        slug,
        logo_url: logoUrl,
        images: imageUrls,
      };

      if (business) {
        // Update existing business
        const { error } = await supabase
          .from("businesses")
          .update({
            ...finalBusinessData,
            status: getBusinessValue('status', 'pending'), // Keep existing status
          })
          .eq("id", business.id);

        if (error) throw error;

        toast.success("Business updated successfully!");
        router.push(`/dashboard/businesses/${business.id}`);
      } else {
        // Create new business
        const { error } = await supabase
          .from("businesses")
          .insert(finalBusinessData);

        if (error) throw error;

        toast.success(
          "Your business listing has been submitted for review. You'll receive a notification once it's approved."
        );
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error saving business:", error);
      toast.error(
        error.message || "An error occurred while saving the business"
      );
    } finally {
      setLoading(false);
    }
  };

  // Live Preview Component
  const LivePreview = () => {
    const config = businessTypeConfig[selectedType];
    const previewBusiness = {
      id: "preview",
      name: watchedValues.name || "Your Business Name",
      business_type: selectedType,
      tagline: watchedValues.tagline || "",
      description: watchedValues.description || "",
      category: watchedValues.category || "Business",
      phone: watchedValues.phone || null,
      email: watchedValues.email || null,
      website: watchedValues.website || null,
      address: watchedValues.address || null,
      city: watchedValues.city || "",
      state: watchedValues.state || "",
      postal_code: watchedValues.postal_code || null,
      logo_url: logoPreview || getBusinessValue('logo_url', null),
      ai_agent_enabled: watchedValues.ai_agent_enabled || false,
      business_hours: {
        monday: watchedValues.mondayHours || null,
        tuesday: watchedValues.tuesdayHours || null,
        wednesday: watchedValues.wednesdayHours || null,
        thursday: watchedValues.thursdayHours || null,
        friday: watchedValues.fridayHours || null,
        saturday: watchedValues.saturdayHours || null,
        sunday: watchedValues.sundayHours || null,
      },
    };

    return (
      <div className="space-y-4">
        {/* Preview Controls */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">Live Preview</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={previewMode === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("desktop")}
            >
              <Monitor className="w-4 h-4 mr-1" />
              Desktop
            </Button>
            <Button
              type="button"
              variant={previewMode === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </Button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
          <div
            className={cn(
              "mx-auto bg-white rounded-lg shadow-sm",
              previewMode === "mobile" ? "max-w-sm" : "max-w-4xl"
            )}
          >
            {/* Hero Section Preview */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                  {previewBusiness.logo_url ? (
                    <img
                      src={previewBusiness.logo_url}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-400">
                      {previewBusiness.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {previewBusiness.name}
                  </h1>
                  {previewBusiness.tagline && (
                    <p className="text-gray-600 text-sm mt-1">
                      {previewBusiness.tagline}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                    {previewBusiness.category && (
                      <Badge variant="outline">{previewBusiness.category}</Badge>
                    )}
                    {previewBusiness.ai_agent_enabled && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Enabled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {previewBusiness.description && (
                <p className="text-gray-600 mb-4">
                  {previewBusiness.description}
                </p>
              )}

              <div className="flex gap-3">
                {previewBusiness.phone && (
                  <Button size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Pencil className="w-4 h-4 mr-1" />
                  Review
                </Button>
              </div>
            </div>

            {/* Sections Preview */}
            <div className="p-6 space-y-4">
              <h3 className="font-semibold">Available Sections</h3>
              <div className="grid grid-cols-2 gap-2">
                {config.sections.map((section) => (
                  <div
                    key={section}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-white rounded border flex items-center justify-center">
                      {section === "menu" && <Utensils className="w-4 h-4" />}
                      {section === "services" && <Settings className="w-4 h-4" />}
                      {section === "products" && <Store className="w-4 h-4" />}
                      {section === "appointments" && <Calendar className="w-4 h-4" />}
                      {section === "reviews" && <Pencil className="w-4 h-4" />}
                      {section === "gallery" && <Sparkles className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {section.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info Preview */}
            <div className="p-6 border-t">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                {previewBusiness.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {previewBusiness.phone}
                  </div>
                )}
                {previewBusiness.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {previewBusiness.email}
                  </div>
                )}
                {previewBusiness.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-gray-400" />
                    {previewBusiness.website}
                  </div>
                )}
                {previewBusiness.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <Map className="w-4 h-4 text-gray-400" />
                    {[
                      previewBusiness.address,
                      previewBusiness.city,
                      previewBusiness.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Field requirements component
  const FieldRequirements = ({ businessType }: { businessType: BusinessType }) => {
    const config = businessTypeConfig[businessType];
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">
              Recommended for {config.label}
            </h4>
            <p className="text-sm text-blue-700 mt-1">{config.description}</p>
            <div className="mt-2">
              <p className="text-xs text-blue-600">
                Examples: {config.examples.join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {business ? "Edit Business" : "Add New Business"}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="lg:hidden"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Type Selection */}
                <Collapsible.Root
                  open={expandedSections.has("type")}
                  onOpenChange={() => toggleSection("type")}
                >
                  <Collapsible.Trigger className="w-full">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Business Type</h3>
                          <p className="text-sm text-gray-600">
                            Choose what best describes your business
                          </p>
                        </div>
                      </div>
                      {expandedSections.has("type") ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(businessTypeConfig).map(([type, config]) => {
                          const Icon = config.icon;
                          const isSelected = form.watch("business_type") === type;
                          
                          return (
                            <div
                              key={type}
                              className={cn(
                                "p-4 border rounded-lg cursor-pointer transition-all",
                                isSelected
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                              onClick={() => {
                                form.setValue("business_type", type as BusinessType);
                                setSelectedType(type as BusinessType);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    isSelected
                                      ? "bg-purple-600 text-white"
                                      : "bg-gray-100 text-gray-600"
                                  )}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{config.label}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {config.description}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {config.examples.join(", ")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <FieldRequirements businessType={selectedType} />
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>

                {/* Basic Information */}
                <Collapsible.Root
                  open={expandedSections.has("basic")}
                  onOpenChange={() => toggleSection("basic")}
                >
                  <Collapsible.Trigger className="w-full">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Basic Information</h3>
                          <p className="text-sm text-gray-600">
                            Essential details about your business
                          </p>
                        </div>
                      </div>
                      {expandedSections.has("basic") ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="name">Business Name *</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="Enter your business name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="tagline">Business Tagline *</Label>
                      <Input
                        id="tagline"
                        {...form.register("tagline")}
                        placeholder="A catchy tagline that describes your business"
                        maxLength={120}
                      />
                      <div className="flex justify-between mt-1">
                        {form.formState.errors.tagline && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.tagline.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground text-right">
                          {form.watch("tagline")?.length || 0}/120 characters
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder={`Describe your ${businessTypeConfig[selectedType].label.toLowerCase()} in detail...`}
                        rows={4}
                      />
                      <div className="flex justify-between mt-1">
                        {form.formState.errors.description && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.description.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground text-right">
                          {form.watch("description")?.length || 0} characters
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        {...form.register("category")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="">Select a category</option>
                        <optgroup label="Suggested for this business type">
                          {suggestedCategories.map((category) => (
                            <option key={category.id} value={category.slug}>
                              {category.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="All categories">
                          {allCategories.map((category) => (
                            <option key={category.id} value={category.slug}>
                              {category.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      {form.formState.errors.category && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.category.message}
                        </p>
                      )}
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>

                {/* Contact Information */}
                <Collapsible.Root
                  open={expandedSections.has("contact")}
                  onOpenChange={() => toggleSection("contact")}
                >
                  <Collapsible.Trigger className="w-full">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Contact Information</h3>
                          <p className="text-sm text-gray-600">
                            How customers can reach you
                          </p>
                        </div>
                      </div>
                      {expandedSections.has("contact") ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="phone">
                            Phone Number
                            {businessTypeConfig[selectedType].recommendedFields.includes("phone") && " *"}
                          </Label>
                          <Input
                            id="phone"
                            {...form.register("phone")}
                            placeholder="(555) 123-4567"
                          />
                          {form.formState.errors.phone && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="whatsappEnabled"
                            {...form.register("whatsapp_enabled")}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded"
                          />
                          <Label htmlFor="whatsappEnabled" className="text-sm font-medium">
                            This number is also available on WhatsApp
                          </Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">
                          Email Address
                          {businessTypeConfig[selectedType].recommendedFields.includes("email") && " *"}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          placeholder="business@example.com"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        {...form.register("website")}
                        placeholder="https://www.yourbusiness.com"
                      />
                      {form.formState.errors.website && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.website.message}
                        </p>
                      )}
                    </div>

                    {/* Social Media Links */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Social Media (Optional)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                          <Input
                            id="facebook"
                            {...form.register("facebook")}
                            placeholder="facebook.com/yourpage"
                          />
                          {form.formState.errors.facebook && (
                            <p className="text-xs text-destructive mt-1">
                              {form.formState.errors.facebook.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                          <Input
                            id="instagram"
                            {...form.register("instagram")}
                            placeholder="instagram.com/yourprofile"
                          />
                          {form.formState.errors.instagram && (
                            <p className="text-xs text-destructive mt-1">
                              {form.formState.errors.instagram.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="twitter" className="text-sm">Twitter/X</Label>
                          <Input
                            id="twitter"
                            {...form.register("twitter")}
                            placeholder="twitter.com/yourhandle"
                          />
                          {form.formState.errors.twitter && (
                            <p className="text-xs text-destructive mt-1">
                              {form.formState.errors.twitter.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            {...form.register("linkedin")}
                            placeholder="linkedin.com/company/yourcompany"
                          />
                          {form.formState.errors.linkedin && (
                            <p className="text-xs text-destructive mt-1">
                              {form.formState.errors.linkedin.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>

                {/* Location */}
                <Collapsible.Root
                  open={expandedSections.has("location")}
                  onOpenChange={() => toggleSection("location")}
                >
                  <Collapsible.Trigger className="w-full">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Map className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Location</h3>
                          <p className="text-sm text-gray-600">
                            {selectedType === "service" 
                              ? "Service area and office location"
                              : "Where customers can find you"
                            }
                          </p>
                        </div>
                      </div>
                      {expandedSections.has("location") ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="address">
                        Street Address
                        {businessTypeConfig[selectedType].recommendedFields.includes("address") && " *"}
                      </Label>
                      <Input
                        id="address"
                        {...form.register("address")}
                        placeholder="123 Main Street"
                      />
                      {form.formState.errors.address && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.address.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address_2">Address Line 2 (Optional)</Label>
                      <Input
                        id="address_2"
                        {...form.register("address_2")}
                        placeholder="Suite, Unit, Building, Floor, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          {...form.register("city")}
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          {...form.register("state")}
                          placeholder="NY"
                        />
                      </div>

                      <div>
                        <Label htmlFor="postal_code">ZIP/Postal Code</Label>
                        <Input
                          id="postal_code"
                          {...form.register("postal_code")}
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...form.register("country")}
                        placeholder="India"
                      />
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>

                {/* Business Hours */}
                {businessTypeConfig[selectedType].recommendedFields.includes("business_hours") && (
                  <Collapsible.Root
                    open={expandedSections.has("hours")}
                    onOpenChange={() => toggleSection("hours")}
                  >
                    <Collapsible.Trigger className="w-full">
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">Business Hours</h3>
                            <p className="text-sm text-gray-600">
                              When customers can visit or call
                            </p>
                          </div>
                        </div>
                        {expandedSections.has("hours") ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </Collapsible.Trigger>
                    <Collapsible.Content className="mt-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter hours in format: 9:00 AM - 5:00 PM or 9:00-17:00 (leave blank for closed)
                      </p>

                      <div className="space-y-3">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <div key={day} className="grid grid-cols-4 items-center gap-3">
                            <Label htmlFor={`${day.toLowerCase()}Hours`} className="text-sm font-medium">
                              {day}
                            </Label>
                            <div className="col-span-3">
                              <Input
                                id={`${day.toLowerCase()}Hours`}
                                {...form.register(
                                  `${day.toLowerCase()}Hours` as keyof EnhancedBusinessFormData
                                )}
                                placeholder="9:00 AM - 5:00 PM"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-blue-900 font-medium">Tips for business hours:</p>
                            <ul className="text-blue-700 mt-1 space-y-1 text-xs">
                              <li>• Use 24-hour format (9:00-17:00) or 12-hour format (9:00 AM - 5:00 PM)</li>
                              <li>• Leave blank for days you're closed</li>
                              <li>• Use "24/7" for always open businesses</li>
                              <li>• Use "By Appointment" for service-based businesses</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                )}

                {/* Media Uploads */}
                <Collapsible.Root
                  open={expandedSections.has("media")}
                  onOpenChange={() => toggleSection("media")}
                >
                  <Collapsible.Trigger className="w-full">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-pink-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Photos & Media</h3>
                          <p className="text-sm text-gray-600">
                            Showcase your business with images
                          </p>
                        </div>
                      </div>
                      {expandedSections.has("media") ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="mt-4 space-y-4">
                    {/* Business Logo Upload */}
                    <div>
                      <Label htmlFor="logoFile">Business Logo</Label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="logoFile"
                          ref={logoFileRef}
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a logo (PNG, JPG, or SVG). Max size: 2MB
                      </p>
                      {/* Show logo preview */}
                      {logoPreview && (
                        <div className="mt-2">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>

                    {/* Gallery Images Upload */}
                    <div>
                      <Label htmlFor="images">Gallery Images</Label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="images"
                          ref={imagesFileRef}
                          accept="image/*"
                          multiple
                          onChange={handleImagesChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload multiple images of your business. Max 10 images, 5MB each.
                      </p>
                      {/* Show gallery previews */}
                      {imagesPreviews.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {imagesPreviews.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-gray-900 font-medium">Photo recommendations:</p>
                          <ul className="text-gray-700 mt-1 space-y-1 text-xs">
                            {selectedType === "restaurant" && (
                              <>
                                <li>• Interior and exterior shots</li>
                                <li>• Food photos and menu items</li>
                                <li>• Kitchen or dining area</li>
                              </>
                            )}
                            {selectedType === "store" && (
                              <>
                                <li>• Store front and interior</li>
                                <li>• Product displays and inventory</li>
                                <li>• Staff and customer areas</li>
                              </>
                            )}
                            {selectedType === "service" && (
                              <>
                                <li>• Before/after work examples</li>
                                <li>• Equipment and tools</li>
                                <li>• Team photos</li>
                              </>
                            )}
                            {selectedType === "professional" && (
                              <>
                                <li>• Office or practice photos</li>
                                <li>• Professional headshots</li>
                                <li>• Certificates and credentials</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>

                {/* AI Assistant Configuration */}
                <Collapsible.Root
                  open={expandedSections.has("ai")}
                  onOpenChange={() => toggleSection("ai")}
                >
                  <Collapsible.Trigger className="w-full">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">AI Assistant</h3>
                          <p className="text-sm text-gray-600">
                            Enable AI to help answer customer questions
                          </p>
                        </div>
                      </div>
                      {expandedSections.has("ai") ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="mt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ai_agent_enabled"
                        {...form.register("ai_agent_enabled")}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded"
                      />
                      <Label htmlFor="ai_agent_enabled" className="text-sm font-medium">
                        Enable AI Assistant for this business
                      </Label>
                    </div>

                    {form.watch("ai_agent_enabled") && (
                      <>
                        <div>
                          <Label htmlFor="ai_prompt">AI Assistant Instructions</Label>
                          <Textarea
                            id="ai_prompt"
                            {...form.register("ai_prompt")}
                            placeholder={`You are a helpful assistant for ${form.watch("name") || "[Business Name]"}. You help customers with information about our ${selectedType === "restaurant" ? "menu, hours, and reservations" : selectedType === "store" ? "products, hours, and services" : selectedType === "service" ? "services, availability, and pricing" : "services and appointments"}. Be friendly and informative.`}
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Customize how your AI assistant responds to customer inquiries
                          </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="text-purple-900 font-medium">AI Assistant will help with:</p>
                              <ul className="text-purple-700 mt-1 space-y-1 text-xs">
                                <li>• Answering customer questions</li>
                                <li>• Providing business information</li>
                                <li>• Helping with bookings/appointments</li>
                                <li>• Available 24/7 for customer support</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </Collapsible.Content>
                </Collapsible.Root>

                {/* Form Actions */}
                <div className="border-t pt-6">
                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 sm:flex-none"
                    >
                      {loading
                        ? "Saving..."
                        : business
                          ? "Update Business"
                          : "Create Business"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className={cn("lg:block", showPreview ? "block" : "hidden")}>
          <div className="sticky top-6">
            <Card>
              <CardContent className="p-6">
                <LivePreview />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}