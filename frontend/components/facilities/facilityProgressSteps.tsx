import { Card, CardContent } from "@/components/ui/card";

interface FacilityProgressStepsProps {
  currentStep: number;
}

const FacilityProgressSteps = ({ currentStep }: FacilityProgressStepsProps) => {
  const steps = [
    { number: 1, title: "Basic Info & Images" },
    { number: 2, title: "Details & Amenities" },
    { number: 3, title: "Availability & Pricing" },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center justify-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 text-white text-sm font-bold ${
                  currentStep >= step.number ? "bg-primary" : "bg-muted"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-sm font-semibold ${
                  currentStep >= step.number
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FacilityProgressSteps;
