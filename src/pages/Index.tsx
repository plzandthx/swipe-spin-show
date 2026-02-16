import RadialSlider from "@/components/RadialSlider";

const sliderCards = [
  {
    id: 1,
    title: "92% ARR Growth",
    description: "Annual recurring revenue growth driven by a culture of innovation and experimentation",
    imagePlaceholder: "🎨 Image",
    bgColor: "224F3C",
    textColor: "white",
  },
  {
    id: 2,
    title: "3X Acquisitions",
    description: "Company acquisitions as head of design",
    imagePlaceholder: "✨ Image",
    bgColor: "295659",
    textColor: "white",
  },
  {
    id: 3,
    title: "25% Optimization",
    description: "Enterprise-level conversion optimization unlocked by deep customer insights",
    imagePlaceholder: "💻 Image",
    bgColor: "FFFFFF",
    textColor: "#333333",
  },
  {
    id: 4,
    title: "4.8 CSAT",
    description: "Customer satisfaction score launching innovative 0→1 product experiences",
    imagePlaceholder: "📊 Image",
    bgColor: "58B469",
    textColor: "white",
  },
  {
    id: 5,
    title: "360% EBITDA Growth",
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
