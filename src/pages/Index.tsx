import RadialSlider from "@/components/RadialSlider";

const sliderCards = [
  {
    id: 1,
    title: "Creative Direction",
    description: "Annual recurring revenue growth driven by a culture of innovation and experimentation",
    imagePlaceholder: "🎨 Image",
    bgColor: "224F3C",
    textColor: "white",
  },
  {
    id: 2,
    title: "Motion Design",
    description: "Company acquisitions as head of design",
    imagePlaceholder: "✨ Image",
    bgColor: "1D6161",
    textColor: "white",
  },
  {
    id: 3,
    title: "Development",
    description: "Enterprise-level conversion optimization unlocked by deep customer insights",
    imagePlaceholder: "💻 Image",
    bgColor: "FFFFFF",
    textColor: "#333333",
  },
  {
    id: 4,
    title: "Strategy",
    description: "Customer satisfaction score launching innovative 0→1 product experiences",
    imagePlaceholder: "📊 Image",
    bgColor: "58B469",
    textColor: "white",
  },
  {
    id: 5,
    title: "Experience",
    description: "EBITDA growth on key verticals while leading design across a FinTech portfolio",
    imagePlaceholder: "🧭 Image",
    bgColor: "0D2B1E",
    textColor: "white",
  },
];

const Index = () => {
  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      <div className="w-full">
        <RadialSlider cards={sliderCards} />
      </div>
      <div className="w-full h-[60vh] flex items-center justify-center">
        <span className="text-muted-foreground text-sm tracking-widest uppercase">Spacer section</span>
      </div>
    </div>
  );
};

export default Index;
