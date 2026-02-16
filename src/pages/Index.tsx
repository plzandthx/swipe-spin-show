import RadialSlider from "@/components/RadialSlider";

const sliderCards = [
  {
    id: 1,
    title: "Creative Direction",
    description: "Shaping brand narratives through bold visual storytelling.",
    imagePlaceholder: "🎨 Image",
    bgColor: "224F3C",
    textColor: "white",
  },
  {
    id: 2,
    title: "Motion Design",
    description: "Fluid animations that bring interfaces to life.",
    imagePlaceholder: "✨ Image",
    bgColor: "1D6161",
    textColor: "white",
  },
  {
    id: 3,
    title: "Development",
    description: "Pixel-perfect code crafted for performance and scale.",
    imagePlaceholder: "💻 Image",
    bgColor: "FFFFFF",
    textColor: "#333333",
  },
  {
    id: 4,
    title: "Strategy",
    description: "Data-driven insights powering every creative decision.",
    imagePlaceholder: "📊 Image",
    bgColor: "58B469",
    textColor: "white",
  },
  {
    id: 5,
    title: "Experience",
    description: "Designing interactions that feel natural and intuitive.",
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
