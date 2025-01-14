import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Let Personality Shine Through
              </h1>
              <p className="text-xl text-gray-600">
                At VibeCheck, we believe that charisma and personality are essential qualities 
                in customer-facing roles that can't be captured in traditional resumes.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Our Mission
                  </h2>
                  <p className="text-lg text-gray-600">
                    We're transforming the hiring process for customer-facing industries by 
                    putting personality first. Through asynchronous video interviews, we help 
                    companies identify candidates whose charisma and energy align perfectly 
                    with their brand.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Why Video?
                  </h2>
                  <p className="text-lg text-gray-600">
                    In customer-facing roles, the ability to connect with people is paramount. 
                    Video interviews allow candidates to showcase their authentic selves, 
                    demonstrating the interpersonal skills that matter most in these positions.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Our Approach
                  </h2>
                  <p className="text-lg text-gray-600">
                    VibeCheck provides a platform where personality can truly shine. Our 
                    asynchronous video interview platform helps hiring managers identify not 
                    just qualified candidates, but those whose energy and charisma will 
                    resonate with customers and strengthen their brand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;