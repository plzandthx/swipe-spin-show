import RadialSlider from "@/components/RadialSlider";

const sliderCards = [
  {
    id: 1,
    title: "Creative Direction",
    description: "Shaping brand narratives through bold visual storytelling.",
    imagePlaceholder: "🎨 Image",
  },
  {
    id: 2,
    title: "Motion Design",
    description: "Fluid animations that bring interfaces to life.",
    imagePlaceholder: "✨ Image",
  },
  {
    id: 3,
    title: "Development",
    description: "Pixel-perfect code crafted for performance and scale.",
    imagePlaceholder: "💻 Image",
  },
  {
    id: 4,
    title: "Strategy",
    description: "Data-driven insights powering every creative decision.",
    imagePlaceholder: "📊 Image",
  },
  {
    id: 5,
    title: "Experience",
    description: "Designing interactions that feel natural and intuitive.",
    imagePlaceholder: "🧭 Image",
  },
];

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full">
        <RadialSlider cards={sliderCards} />
      </div>
    </div>
  );
};

export default Index;
