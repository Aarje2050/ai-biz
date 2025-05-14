"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  enhancedBusinessSchema,
  EnhancedBusinessFormData,
  createBusinessTypeSchema,
  transformFormToBusinessData,
} from "@/lib/schemas/business-form-schema";
import { BusinessType } from "@/types/business";
import {
  MAIN_CATEGORIES,
  getSuggestedCategories,
} from "@/lib/data/categories";


// Replace your existing CustomStepper with this:
const CustomStepper = ({ 
 
  calculateProgress // Add this prop
}: { 
  steps: FormStep[], 
  currentStep: string, 
  onStepClick: (stepId: string) => void,
  calculateProgress: () => number // Add this type
}) => {
  return (
    <div className="w-full mb-8">
  
      
      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{calculateProgress()}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Step Navigation Component
const StepNavigation = ({ 
  onPrevious, 
  onNext, 
  onSubmit, 
  canGoNext,
  isFirstStep,
  isLastStep,
  loading,
  currentStep // Add this prop
}: {
  onPrevious: () => void,
  onNext: () => void,
  onSubmit: () => void,
  canGoNext: boolean,
  isFirstStep: boolean,
  isLastStep: boolean,
  loading: boolean,
  currentStep: string // Add this type
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      
      {/* Fix: Only show submit button on actual last step */}
      {isLastStep ? (
        <Button
          type="button" // Change to button, not submit
          onClick={onSubmit}
          disabled={!canGoNext || loading}
          className="flex items-center gap-2"
        >
          {loading ? "Saving..." : "Create Business"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

// Type definitions
interface BusinessFormProps {
  business?: Database["public"]["Tables"]["businesses"]["Row"];
}

type FormStep = {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isRequired: boolean;
  fields: string[];
}
// business type config

const businessTypeConfig = {
  service: {
    icon: Briefcase,
    label: "Service Business",
    description: "Professional services, consultations, repairs",
    examples: ["Plumbing", "Legal Services", "Consulting"],
    sections: ["services", "appointments", "reviews", "gallery"],
    recommendedFields: ["phone", "email", "hours", "service_area"],
    requiredSteps: ["type", "basic", "contact"], // ADD THIS
  },
  store: {
    icon: Store,
    label: "Store/Retail", 
    description: "Physical or online stores selling products",
    examples: ["Clothing Store", "Electronics", "Grocery"],
    sections: ["products", "reviews", "gallery", "delivery"],
    recommendedFields: ["address", "hours", "payment_methods"],
    requiredSteps: ["type", "basic", "contact", "location", "hours"], // ADD THIS
  },
  restaurant: {
    icon: Utensils,
    label: "Restaurant",
    description: "Restaurants, cafes, food services", 
    examples: ["Restaurant", "Cafe", "Food Truck"],
    sections: ["menu", "table_booking", "reviews", "gallery"],
    recommendedFields: ["address", "phone", "hours", "delivery"],
    requiredSteps: ["type", "basic", "contact", "location", "hours"], // ADD THIS
  },
  professional: {
    icon: Briefcase,
    label: "Professional Services",
    description: "Healthcare, legal, financial services",
    examples: ["Doctor", "Lawyer", "Accountant"], 
    sections: ["services", "appointments", "reviews", "staff"],
    recommendedFields: ["phone", "email", "credentials", "appointments"],
    requiredSteps: ["type", "basic", "contact"], // ADD THIS
  },
};

// Initial steps configuration
const initialSteps: FormStep[] = [
  {
    id: "type",
    title: "Business Type",
    description: "What kind of business do you have?",
    isComplete: false,
    isRequired: true,
    fields: ["business_type"]
  },
  {
    id: "basic",
    title: "Basic Information",
    description: "Tell us about your business",
    isComplete: false,
    isRequired: true,
    fields: ["name", "tagline", "description", "category"]
  },
  {
    id: "contact",
    title: "Contact Details",
    description: "How can customers reach you?",
    isComplete: false,
    isRequired: true,
    fields: ["phone", "email"]
  },
  {
    id: "location",
    title: "Location",
    description: "Where is your business located?",
    isComplete: false,
    isRequired: false,
    fields: ["address", "city", "state"]
  },
  {
    id: "hours",
    title: "Business Hours",
    description: "When are you open?",
    isComplete: false,
    isRequired: false,
    fields: ["mondayHours"]
  },
  {
    id: "media",
    title: "Photos & Media",
    description: "Show off your business",
    isComplete: false,
    isRequired: false,
    fields: []
  }
];

export function BusinessForm({ business }: BusinessFormProps) {
  const [steps, setSteps] = useState<FormStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<string>("type");
  const [selectedType, setSelectedType] = useState<BusinessType>("service");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  
  const logoFileRef = useRef<HTMLInputElement>(null);
  const imagesFileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();
  // In your main component, fix the isLastStep logic
const isLastStep = currentStep === steps[steps.length - 1]?.id;

  // Helper functions
  
  const getBusinessValue = (key: string, fallback: any = null) => {
    if (!business) return fallback;
    
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      const parentValue = business[parent as keyof typeof business];
      if (parentValue && typeof parentValue === 'object' && parentValue !== null) {
        return (parentValue as any)[child] || fallback;
      }
      return fallback;
    }
    
    return business[key as keyof typeof business] || fallback;
  };
 // ADD THESE TWO FUNCTIONS RIGHT HERE:
const calculateProgress = (): number => {
  const requiredSteps = steps.filter(step => step.isRequired);
  const completedRequired = requiredSteps.filter(step => step.isComplete);
  const completedOptional = steps.filter(step => !step.isRequired && step.isComplete);
  
  const requiredProgress = (completedRequired.length / requiredSteps.length) * 80;
  const optionalProgress = (completedOptional.length / (steps.length - requiredSteps.length)) * 20;
  
  return Math.round(requiredProgress + optionalProgress);
};

const updateStepRequirements = (businessType: BusinessType) => {
  const config = businessTypeConfig[businessType];
  setSteps(prev => prev.map(step => ({
    ...step,
    isRequired: config.requiredSteps.includes(step.id)
  })));
};

  const validateStep = (stepId: string): boolean => {
    const formData = form.getValues();
    
    switch (stepId) {
      case 'type':
        return !!formData.business_type;
      
      case 'basic':
        return !!(formData.name?.trim() && 
                 formData.tagline?.trim() && 
                 formData.description?.trim() && 
                 formData.category);
      
      case 'contact':
        return !!(formData.phone?.trim() || formData.email?.trim());
      
      case 'location':
        if (['restaurant', 'store'].includes(selectedType)) {
          return !!(formData.address?.trim() && formData.city?.trim());
        }
        return true;
      
      case 'hours':
        if (['restaurant', 'store'].includes(selectedType)) {
          const hours = [
            formData.mondayHours,
            formData.tuesdayHours,
            formData.wednesdayHours,
            formData.thursdayHours,
            formData.fridayHours,
            formData.saturdayHours,
            formData.sundayHours
          ];
          return hours.some(h => h?.trim());
        }
        return true;
      
      default:
        return true;
    }
  };



  const goToStep = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    // Can't go forward without completing current step
    if (stepIndex > currentIndex && !validateStep(currentStep)) {
      toast.error("Please complete the current step before continuing");
      return;
    }
    
    setCurrentStep(stepId);
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please complete all required fields");
      return;
    }

    // Mark current step as complete
    setSteps(prev => prev.map(step => 
      step.id === currentStep ? { ...step, isComplete: true } : step
    ));

    // Find next step
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const nextStep = steps[currentIndex + 1];
    
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const prevStep = steps[currentIndex - 1];
    
    if (prevStep) {
      setCurrentStep(prevStep.id);
    }
  };

 // Initialize form with dynamic schema
 const form = useForm<EnhancedBusinessFormData>({
  resolver: zodResolver(createBusinessTypeSchema(selectedType)),
  mode: "onChange",
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
    address_2: '',
    city: getBusinessValue('city', ''),
    state: getBusinessValue('state', ''),
    postal_code: getBusinessValue('postal_code', '') || getBusinessValue('zip_code', ''),
    country: getBusinessValue('country', 'India'),
    
    // Social media
    facebook: getBusinessValue('social_media.facebook', ''),
    instagram: getBusinessValue('social_media.instagram', ''),
    twitter: getBusinessValue('social_media.twitter', ''),
    linkedin: getBusinessValue('social_media.linkedin', ''),
    youtube: getBusinessValue('social_media.youtube', ''),
    
    // Business hours
    mondayHours: getBusinessValue('hours.monday', ''),
    tuesdayHours: getBusinessValue('hours.tuesday', ''),
    wednesdayHours: getBusinessValue('hours.wednesday', ''),
    thursdayHours: getBusinessValue('hours.thursday', ''),
    fridayHours: getBusinessValue('hours.friday', ''),
    saturdayHours: getBusinessValue('hours.saturday', ''),
    sundayHours: getBusinessValue('hours.sunday', ''),
    
    // // Additional fields
    // tags: getBusinessValue('tags', []),
    // amenities: getBusinessValue('amenities', []),
    // payment_methods: getBusinessValue('payment_methods', []),
    // languages_spoken: getBusinessValue('languages_spoken', []),
    
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

// Replace your existing businessTypeConfig with this:
const businessTypeConfig = {
  service: {
    icon: Briefcase,
    label: "Service Business",
    description: "Professional services, consultations, repairs",
    examples: ["Plumbing", "Legal Services", "Consulting"],
    sections: ["services", "appointments", "reviews", "gallery"],
    recommendedFields: ["phone", "email", "hours", "service_area"],
    requiredSteps: ["type", "basic", "contact"], // Add this line
  },
  store: {
    icon: Store,
    label: "Store/Retail",
    description: "Physical or online stores selling products",
    examples: ["Clothing Store", "Electronics", "Grocery"],
    sections: ["products", "reviews", "gallery", "delivery"],
    recommendedFields: ["address", "hours", "payment_methods"],
    requiredSteps: ["type", "basic", "contact", "location", "hours"], // Add this line
  },
  restaurant: {
    icon: Utensils,
    label: "Restaurant",
    description: "Restaurants, cafes, food services",
    examples: ["Restaurant", "Cafe", "Food Truck"],
    sections: ["menu", "table_booking", "reviews", "gallery"],
    recommendedFields: ["address", "phone", "hours", "delivery"],
    requiredSteps: ["type", "basic", "contact", "location", "hours"], // Add this line
  },
  professional: {
    icon: Briefcase,
    label: "Professional Services",
    description: "Healthcare, legal, financial services",
    examples: ["Doctor", "Lawyer", "Accountant"],
    sections: ["services", "appointments", "reviews", "staff"],
    recommendedFields: ["phone", "email", "credentials", "appointments"],
    requiredSteps: ["type", "basic", "contact"], // Add this line
  },
};

  // Handle file uploads
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      form.setValue("logoFile", files);
      if (files[0]) {
        
      }
    }
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      form.setValue("images", files);
    }
  };

 
  // Get suggested categories based on business type
  const suggestedCategories = getSuggestedCategories(selectedType);
  const allCategories = MAIN_CATEGORIES;

  // Form submission
  // const onSubmit = async (data: EnhancedBusinessFormData) => {
  //   setLoading(true);

  //   try {
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();

  //     if (!user) {
  //       toast.error("You must be logged in to perform this action");
  //       return;
  //     }

  //     // Transform form data to match database schema
  //     const businessData = transformFormToBusinessData(data);

  //     // Handle file uploads (simplified for now)
  //     let logoUrl = getBusinessValue('logo_url', null);
  //     let imageUrls: string[] = getBusinessValue('images', []);

  //     // Upload logo if provided
  //     if (data.logoFile && data.logoFile.length > 0) {
  //       const logoFile = data.logoFile[0];
  //       const logoPath = `${user.id}/logo-${Date.now()}-${logoFile.name}`;

  //       const { error: logoError } = await supabase.storage
  //         .from("business-media")
  //         .upload(logoPath, logoFile);

  //       if (logoError) throw logoError;

  //       const { data: logoPublic } = supabase.storage
  //         .from("business-media")
  //         .getPublicUrl(logoPath);

  //       logoUrl = logoPublic.publicUrl;
  //     }

  //     // Upload gallery images if provided
  //     if (data.images && data.images.length > 0) {
  //       const filesArray = Array.from(data.images);

  //       const uploadPromises = filesArray.map(async (file, index) => {
  //         const imagePath = `${user.id}/gallery-${Date.now()}-${index}-${file.name}`;

  //         const { error: imageError } = await supabase.storage
  //           .from("business-media")
  //           .upload(imagePath, file);

  //         if (imageError) throw imageError;

  //         const { data: imagePublic } = supabase.storage
  //           .from("business-media")
  //           .getPublicUrl(imagePath);

  //         return imagePublic.publicUrl;
  //       });

  //       imageUrls = await Promise.all(uploadPromises);
  //     }

  //     const slug = getBusinessValue('slug', null) || generateSlug(data.name);

  //     const finalBusinessData = {
  //       ...businessData,
  //       owner_id: user.id,
  //       slug,
  //       logo_url: logoUrl,
  //       images: imageUrls,
  //     };

  //     if (business) {
  //       // Update existing business
  //       const { error } = await supabase
  //         .from("businesses")
  //         .update({
  //           ...finalBusinessData,
  //           status: getBusinessValue('status', 'pending'), // Keep existing status
  //         })
  //         .eq("id", business.id);

  //       if (error) throw error;

  //       toast.success("Business updated successfully!");
  //       router.push(`/dashboard/businesses/${business.id}`);
  //     } else {
  //       // Create new business
  //       const { error } = await supabase
  //         .from("businesses")
  //         .insert(finalBusinessData);

  //       if (error) throw error;

  //       toast.success(
  //         "Your business listing has been submitted for review. You'll receive a notification once it's approved."
  //       );
  //       router.push("/dashboard");
  //     }
  //   } catch (error: any) {
  //     console.error("Error saving business:", error);
  //     toast.error(
  //       error.message || "An error occurred while saving the business"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

 

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

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return renderBusinessTypeStep();
      case 'basic':
        return renderBasicInfoStep();
      case 'contact':
        return renderContactStep();
      case 'location':
        return renderLocationStep();
      case 'hours':
        return renderBusinessHoursStep();
      case 'media':
        return renderMediaStep();
      default:
        return null;
    }
  };

  const renderBusinessTypeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What type of business do you have?</h2>
        <p className="text-gray-600 mt-2">Choose the category that best describes your business</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(businessTypeConfig).map(([type, config]) => {
          const Icon = config.icon;
          const isSelected = form.watch("business_type") === type;
          
          return (
            <div
              key={type}
              className={cn(
                "p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg",
                isSelected
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => {
                form.setValue("business_type", type as BusinessType);
                setSelectedType(type as BusinessType);
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    isSelected
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{config.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: {config.examples.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">
                Requirements for {businessTypeConfig[selectedType].label}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {businessTypeConfig[selectedType].description}
              </p>
              <div className="mt-2">
                <p className="text-xs text-blue-600">
                  Required steps: {businessTypeConfig[selectedType].requiredSteps.length} of {steps.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your business</h2>
        <p className="text-gray-600 mt-2">Provide the basic information that describes your business</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Business Name *</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Enter your business name"
            className="h-12"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tagline">Business Tagline *</Label>
          <Input
            id="tagline"
            {...form.register("tagline")}
            placeholder="A catchy tagline that describes your business"
            maxLength={120}
            className="h-12"
          />
          <div className="flex justify-between mt-1">
            {form.formState.errors.tagline && (
              <p className="text-sm text-red-600">{form.formState.errors.tagline.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {form.watch("tagline")?.length || 0}/120 characters
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            {...form.register("category")}
            className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            <optgroup label="Suggested for this business type">
              {getSuggestedCategories(selectedType).map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="All categories">
              {MAIN_CATEGORIES.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          </select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.category.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Business Description *</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder={`Describe your ${businessTypeConfig[selectedType].label.toLowerCase()} in detail...`}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-between mt-1">
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {form.watch("description")?.length || 0} characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">How can customers reach you?</h2>
        <p className="text-gray-600 mt-2">Provide at least one way for customers to contact you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">
              Phone Number
              {businessTypeConfig[selectedType].requiredSteps.includes('contact') && 
               !form.watch('email')?.trim() && ' *'}
            </Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="(555) 123-4567"
              className="h-12"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="whatsappEnabled"
              {...form.register("whatsapp_enabled")}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
            />
            <Label htmlFor="whatsappEnabled" className="text-sm font-medium">
              This number is also available on WhatsApp
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="email">
            Email Address
            {businessTypeConfig[selectedType].requiredSteps.includes('contact') && 
             !form.watch('phone')?.trim() && ' *'}
          </Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="business@example.com"
            className="h-12"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          {...form.register("website")}
          placeholder="https://www.yourbusiness.com"
          className="h-12"
        />
        {form.formState.errors.website && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.website.message}</p>
        )}
      </div>

      {/* Social Media Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">Social Media (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebook" className="text-sm">Facebook</Label>
            <Input
              id="facebook"
              {...form.register("facebook")}
              placeholder="facebook.com/yourpage"
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="instagram" className="text-sm">Instagram</Label>
            <Input
              id="instagram"
              {...form.register("instagram")}
              placeholder="instagram.com/yourprofile"
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="twitter" className="text-sm">Twitter/X</Label>
            <Input
              id="twitter"
              {...form.register("twitter")}
              placeholder="twitter.com/yourhandle"
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
            <Input
              id="linkedin"
              {...form.register("linkedin")}
              placeholder="linkedin.com/company/yourcompany"
              className="h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Where is your business located?</h2>
        <p className="text-gray-600 mt-2">
          {['restaurant', 'store'].includes(selectedType)
            ? 'Customers need to know where to find you'
            : 'This helps customers in your area find your services'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="address">
            Street Address
            {['restaurant', 'store'].includes(selectedType) && ' *'}
          </Label>
          <Input
            id="address"
            {...form.register("address")}
            placeholder="123 Main Street"
            className="h-12"
          />
          {form.formState.errors.address && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.address.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address_2">Address Line 2 (Optional)</Label>
          <Input
            id="address_2"
            {...form.register("address_2")}
            placeholder="Suite, Unit, Building, Floor, etc."
            className="h-12"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">
              City
              {['restaurant', 'store'].includes(selectedType) && ' *'}
            </Label>
            <Input
              id="city"
              {...form.register("city")}
              placeholder="New York"
              className="h-12"
            />
            {form.formState.errors.city && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              {...form.register("state")}
              placeholder="NY"
              className="h-12"
            />
          </div>

          <div>
            <Label htmlFor="postal_code">ZIP/Postal Code</Label>
            <Input
              id="postal_code"
              {...form.register("postal_code")}
              placeholder="10001"
              className="h-12"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...form.register("country")}
            placeholder="India"
            className="h-12"
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessHoursStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">When are you open?</h2>
        <p className="text-gray-600 mt-2">
          {['restaurant', 'store'].includes(selectedType)
            ? 'Let customers know when they can visit'
            : 'Set your availability for appointments and consultations'
          }
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-900 font-medium">Hour Format Tips:</p>
            <ul className="text-blue-700 mt-1 space-y-1 text-xs list-disc ml-4">
              <li>Use 24-hour format (9:00-17:00) or 12-hour format (9:00 AM - 5:00 PM)</li>
              <li>Leave blank for days you're closed</li>
              <li>Use "24/7" for always open</li>
              <li>Use "By Appointment" for appointment-based services</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { key: "monday", label: "Monday" },
          { key: "tuesday", label: "Tuesday" },
          { key: "wednesday", label: "Wednesday" },
          { key: "thursday", label: "Thursday" },
          { key: "friday", label: "Friday" },
          { key: "saturday", label: "Saturday" },
          { key: "sunday", label: "Sunday" },
        ].map((day) => (
          <div key={day.key} className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor={`${day.key}Hours`} className="text-sm font-medium">
              {day.label}
            </Label>
            <div className="col-span-3">
              <Input
                id={`${day.key}Hours`}
                {...form.register(`${day.key}Hours` as keyof EnhancedBusinessFormData)}
                placeholder="9:00 AM - 5:00 PM"
                className="h-10"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick preset buttons */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Presets:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const businessHours = "9:00 AM - 5:00 PM";
              ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(day => {
                form.setValue(`${day}Hours` as keyof EnhancedBusinessFormData, businessHours);
              });
            }}
          >
            Mon-Fri 9-5
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const businessHours = "9:00 AM - 6:00 PM";
              ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].forEach(day => {
                form.setValue(`${day}Hours` as keyof EnhancedBusinessFormData, businessHours);
              });
            }}
          >
            Mon-Sat 9-6
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
              allDays.forEach(day => {
                form.setValue(`${day}Hours` as keyof EnhancedBusinessFormData, "24/7");
              });
            }}
          >
            24/7
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMediaStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Showcase your business</h2>
        <p className="text-gray-600 mt-2">Add photos to make your listing more attractive to customers</p>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
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
          <p className="text-xs text-gray-500 mt-1">Upload a logo (PNG, JPG, or SVG). Max size: 2MB</p>
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

        {/* Gallery Images */}
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
          <p className="text-xs text-gray-500 mt-1">Upload multiple images. Max 10 images, 5MB each.</p>
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

        {/* Photo recommendations based on business type */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-900 font-medium">Photo recommendations for {businessTypeConfig[selectedType].label}:</p>
              <ul className="text-gray-700 mt-1 space-y-1 text-xs list-disc ml-4">
                {selectedType === "restaurant" && (
                  <>
                    <li>Interior and exterior shots</li>
                    <li>Food photos and popular dishes</li>
                    <li>Dining area and ambiance</li>
                    <li>Kitchen or food preparation area</li>
                  </>
                )}
                {selectedType === "store" && (
                  <>
                    <li>Store front and entrance</li>
                    <li>Interior layout and displays</li>
                    <li>Featured products</li>
                    <li>Staff and customer service areas</li>
                  </>
                )}
                {selectedType === "service" && (
                  <>
                    <li>Before/after work examples</li>
                    <li>Equipment and tools</li>
                    <li>Team photos</li>
                    <li>Work in progress shots</li>
                  </>
                )}
                {selectedType === "professional" && (
                  <>
                    <li>Office or practice exterior/interior</li>
                    <li>Professional headshots</li>
                    <li>Certificates and credentials</li>
                    <li>Consultation or treatment rooms</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // AI Assistant Step (optional - can be added later)
  const renderAIStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">AI Assistant (Optional)</h2>
        <p className="text-gray-600 mt-2">Enable AI to help answer customer questions 24/7</p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-purple-900">AI Assistant Benefits</h3>
            <ul className="text-sm text-purple-700 mt-2 space-y-1">
              <li>• Answer customer questions instantly</li>
              <li>• Provide business information 24/7</li>
              <li>• Help with bookings and appointments</li>
              <li>• Reduce response time and improve customer satisfaction</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="ai_agent_enabled"
          {...form.register("ai_agent_enabled")}
          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
        />
        <Label htmlFor="ai_agent_enabled" className="text-sm font-medium">
          Enable AI Assistant for this business
        </Label>
      </div>

      {form.watch("ai_agent_enabled") && (
        <div>
          <Label htmlFor="ai_prompt">AI Assistant Instructions</Label>
          <Textarea
            id="ai_prompt"
            {...form.register("ai_prompt")}
            placeholder={`You are a helpful assistant for ${form.watch("name") || "[Business Name]"}. You help customers with information about our ${selectedType === "restaurant" ? "menu, hours, and reservations" : selectedType === "store" ? "products, hours, and services" : selectedType === "service" ? "services, availability, and pricing" : "services and appointments"}. Be friendly and informative.`}
            rows={4}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Customize how your AI assistant responds to customer inquiries
          </p>
        </div>
      )}
    </div>
  );




// Add auto-save functionality that saves draft without submitting
const [draftSaved, setDraftSaved] = useState(false);

const saveDraft = useCallback(async () => {
  const formData = form.getValues();
  // Save to localStorage as draft
  localStorage.setItem('business-form-draft', JSON.stringify(formData));
  setDraftSaved(true);
  setTimeout(() => setDraftSaved(false), 2000);
}, [form]);

// Auto-save every 30 seconds
useEffect(() => {
  const interval = setInterval(saveDraft, 30000);
  return () => clearInterval(interval);
}, [saveDraft]);

// Show draft saved indicator
{draftSaved && (
  <div className="text-green-600 text-sm">Draft saved ✓</div>
)}
 // Form submission logic ( New )
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

    // Handle file uploads
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
          status: getBusinessValue('status', 'pending'),
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

// Main component return
return (
  <div className="container max-w-4xl mx-auto py-8 px-4">
    {/* Custom Stepper */}
    <CustomStepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={goToStep}
  calculateProgress={calculateProgress} // Add this line
/>

    {/* Main Form Card */}
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center">
          {business ? "Edit Business" : "Create Your Business Listing"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Render current step content */}
          {renderStepContent()}

          {/* // And update how you call StepNavigation */}
<StepNavigation
  onPrevious={goToPreviousStep}
  onNext={goToNextStep}
  onSubmit={() => form.handleSubmit(onSubmit)()} // Fix: Call form submit properly
  canGoNext={validateStep(currentStep)}
  isFirstStep={currentStep === steps[0]?.id}
  isLastStep={isLastStep}
  loading={loading}
  currentStep={currentStep} // Add this prop
/>
        </form>
      </CardContent>
    </Card>

    {/* Help/Tips Section */}
    <div className="mt-8 bg-gray-50 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-gray-900">Need Help?</h3>
          <p className="text-sm text-gray-600 mt-1">
            Our step-by-step wizard makes it easy to create your business listing. 
            Complete the required fields marked with *, and feel free to skip optional sections for now - 
            you can always come back and add more details later.
          </p>
        </div>
      </div>
    </div>
  </div>
);
}
