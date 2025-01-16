import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BookOpenCheck,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  Brain,
  ImageIcon,
  GitBranch,
  MessageSquareText,
  Check,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold">Ai Book Generation AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-amber-500 hover:bg-amber-600">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-transparent bg-clip-text">
              AI-Powered Book Creation
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your ideas into professional books with AI assistance. Generate content, images, and summaries instantly.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/auth">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                Start Creating Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* AI Animation */}
          <motion.div
            className="mt-12 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-6 text-white font-mono">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="text-amber-500" />
                <span>AI Writing Assistant</span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="typing-animation"
              >
                <p className="text-green-400">Generating chapter outline...</p>
                <p className="text-amber-400 mt-2">Creating character descriptions...</p>
                <p className="text-blue-400 mt-2">Enhancing narrative flow...</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8"
          >
            <motion.div
              variants={fadeIn}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-100"
            >
              <Brain className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Writing</h3>
              <p className="text-gray-600">Advanced NLP for structured, high-quality book creation</p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-100"
            >
              <ImageIcon className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Image Generation</h3>
              <p className="text-gray-600">AI-powered contextual image creation for your content</p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-100"
            >
              <GitBranch className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Diagrams</h3>
              <p className="text-gray-600">Automated flowchart and diagram generation</p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-100"
            >
              <MessageSquareText className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">RAG Chatbot</h3>
              <p className="text-gray-600">Intelligent content summarization and cheat sheets</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the perfect plan for your creative journey</p>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* Basic Plan */}
            <motion.div variants={fadeIn}>
              <Card className="p-8 hover:shadow-lg transition-all">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-gray-600 mb-4">Perfect for beginners</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>1 Book per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Basic AI assistance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>5 AI images per book</span>
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeIn}>
              <Card className="p-8 border-amber-500 border-2 hover:shadow-lg transition-all relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="text-gray-600 mb-4">For serious authors</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited books</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Advanced AI features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>20 AI images per book</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-amber-500 hover:bg-amber-600">Get Started</Button>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div variants={fadeIn}>
              <Card className="p-8 hover:shadow-lg transition-all">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">For teams & publishers</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited everything</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Custom AI training</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>API access</span>
                  </li>
                </ul>
                <Button className="w-full">Contact Sales</Button>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Authors Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied writers</p>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                name: "Sarah Johnson",
                role: "Fantasy Author",
                content: "Ai Book Generation AI transformed my writing process. The AI suggestions and image generation are incredible!",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Technical Writer",
                content: "The flowchart generation and RAG chatbot have made technical documentation a breeze.",
                rating: 5
              },
              {
                name: "Emily Parker",
                role: "Children's Book Author",
                content: "The AI image generation perfectly captures my story's imagination. A game-changer!",
                rating: 5
              }
            ].map((review, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{review.content}</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-700 font-semibold">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Start Your AI Writing Journey Today</h2>
            <p className="text-xl mb-8 text-gray-300">Join the future of book creation with Ai Book Generation AI</p>
            <Link to="/auth">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                Get Started For Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}