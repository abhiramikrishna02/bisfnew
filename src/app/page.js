import Footer from "@/Componants/Footer";
import Navbar from "@/Componants/Navbar";
import Home from "@/Sections/Home";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
}
