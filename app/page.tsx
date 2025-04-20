import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PhoneCall, Mail, MapPin, Clock, CheckCircle, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background z-50">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="font-bold text-2xl">
          Logo
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <PhoneCall className="mr-2 h-4 w-4" />
            (31) 99999-9999
          </Button>
          <Button className="hidden md:flex">Solicitar Orçamento</Button>
          <Button variant="secondary" size="sm" className="hidden md:flex" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="#inicio" className="text-lg font-medium hover:text-primary">
                  Início
                </Link>
                <Link href="#sobre" className="text-lg font-medium hover:text-primary">
                  Sobre
                </Link>
                <Link href="#servicos" className="text-lg font-medium hover:text-primary">
                  Serviços
                </Link>
                <Link href="#projetos" className="text-lg font-medium hover:text-primary">
                  Projetos
                </Link>
                <Link href="#depoimentos" className="text-lg font-medium hover:text-primary">
                  Depoimentos
                </Link>
                <Link href="#contato" className="text-lg font-medium hover:text-primary">
                  Contato
                </Link>
                <div className="pt-4 mt-4 border-t">
                  <Button className="w-full mb-2">Solicitar Orçamento</Button>
                  <Button variant="outline" size="sm" className="w-full mb-2">
                    <PhoneCall className="mr-2 h-4 w-4" />
                    (31) 99999-9999
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full" asChild>
                    <Link href="/login">Entrar</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="inicio" className="relative">
          <div className="absolute inset-0 z-0">
            <Image src="/sleek-modern-estate.png" alt="Mansão de Luxo" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="container relative z-10 py-24 md:py-32 lg:py-40">
            <div className="max-w-2xl text-white">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Construindo Mansões de Luxo para Vidas Extraordinárias
              </h1>
              <p className="mb-8 text-lg text-gray-200">
                Há mais de 20 anos transformando sonhos em realidade com projetos exclusivos e acabamentos impecáveis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-md">
                  Conheça Nossos Projetos
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-md text-white border-white hover:text-white hover:bg-white/20"
                >
                  Fale Conosco
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="sobre" className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">Excelência em Construção de Alto Padrão</h2>
                <p className="text-muted-foreground mb-6">
                  A Master Construtora é especializada na construção de mansões e residências de alto padrão, oferecendo
                  soluções personalizadas que combinam design sofisticado, materiais premium e tecnologia de ponta.
                </p>
                <p className="text-muted-foreground mb-6">
                  Nossa equipe de arquitetos, engenheiros e designers trabalha em perfeita harmonia para criar espaços
                  que refletem a personalidade e o estilo de vida de nossos clientes, garantindo que cada projeto seja
                  único e excepcional.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>20+ anos de experiência</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Projetos exclusivos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Materiais premium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Equipe especializada</span>
                  </div>
                </div>
                <Button>
                  Conheça Nossa História
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                <Image src="/modern-luxury-living.png" alt="Interior de Mansão" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Nossos Serviços</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Oferecemos uma gama completa de serviços para transformar sua visão em realidade, desde o projeto
                arquitetônico até a entrega das chaves.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Projeto Arquitetônico</h3>
                <p className="text-muted-foreground mb-4">
                  Desenvolvemos projetos arquitetônicos exclusivos, alinhados com suas preferências e necessidades.
                </p>
                <Link href="#" className="text-primary font-medium inline-flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Service 2 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                    <path d="M9 22v-4h6v4" />
                    <path d="M8 6h.01" />
                    <path d="M16 6h.01" />
                    <path d="M12 6h.01" />
                    <path d="M12 10h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 10h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 10h.01" />
                    <path d="M8 14h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Construção Completa</h3>
                <p className="text-muted-foreground mb-4">
                  Executamos todo o processo construtivo com materiais de primeira linha e mão de obra especializada.
                </p>
                <Link href="#" className="text-primary font-medium inline-flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Service 3 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m7 10 2 2 6-6" />
                    <path d="m7 16 2 2 6-6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Design de Interiores</h3>
                <p className="text-muted-foreground mb-4">
                  Criamos ambientes sofisticados e funcionais que refletem seu estilo de vida e personalidade.
                </p>
                <Link href="#" className="text-primary font-medium inline-flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Service 4 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                    <path d="M12 3v6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Paisagismo</h3>
                <p className="text-muted-foreground mb-4">
                  Projetamos áreas externas deslumbrantes que complementam a arquitetura e valorizam seu imóvel.
                </p>
                <Link href="#" className="text-primary font-medium inline-flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Service 5 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Automação Residencial</h3>
                <p className="text-muted-foreground mb-4">
                  Implementamos sistemas inteligentes para controle de iluminação, segurança, áudio e vídeo.
                </p>
                <Link href="#" className="text-primary font-medium inline-flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Service 6 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v2" />
                    <path d="M13 17v2" />
                    <path d="M13 11v2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Manutenção e Reforma</h3>
                <p className="text-muted-foreground mb-4">
                  Realizamos manutenções preventivas e reformas para manter sua residência sempre impecável.
                </p>
                <Link href="#" className="text-primary font-medium inline-flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projetos" className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Projetos Realizados</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conheça alguns dos nossos projetos mais exclusivos, onde transformamos sonhos em realidade.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project 1 */}
              <div className="group overflow-hidden rounded-lg shadow-md">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/sleek-modern-estate.png"
                    alt="Mansão Moderna"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 bg-card">
                  <h3 className="text-xl font-bold mb-2">Mansão Alphaville</h3>
                  <p className="text-muted-foreground mb-4">
                    Projeto contemporâneo com 850m² de área construída, 5 suítes e piscina com borda infinita.
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>

              {/* Project 2 */}
              <div className="group overflow-hidden rounded-lg shadow-md">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/coastal-estate.png"
                    alt="Casa de Praia"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 bg-card">
                  <h3 className="text-xl font-bold mb-2">Residência Beira-Mar</h3>
                  <p className="text-muted-foreground mb-4">
                    Casa de praia com 620m², arquitetura sustentável e vista panorâmica para o oceano.
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>

              {/* Project 3 */}
              <div className="group overflow-hidden rounded-lg shadow-md">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/glass-peak-retreat.png"
                    alt="Casa na Montanha"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 bg-card">
                  <h3 className="text-xl font-bold mb-2">Refúgio na Serra</h3>
                  <p className="text-muted-foreground mb-4">
                    Residência de campo com 750m², integração com a natureza e materiais sustentáveis.
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>

              {/* Project 4 */}
              <div className="group overflow-hidden rounded-lg shadow-md">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/serene-poolside-retreat.png"
                    alt="Casa Minimalista"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 bg-card">
                  <h3 className="text-xl font-bold mb-2">Residência Minimalista</h3>
                  <p className="text-muted-foreground mb-4">
                    Projeto com 580m², linhas retas, grandes vãos e integração total entre ambientes.
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>

              {/* Project 5 */}
              <div className="group overflow-hidden rounded-lg shadow-md">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/grand-columned-estate.png"
                    alt="Mansão Clássica"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 bg-card">
                  <h3 className="text-xl font-bold mb-2">Mansão Neoclássica</h3>
                  <p className="text-muted-foreground mb-4">
                    Residência de 920m² com elementos clássicos, pé direito duplo e acabamentos nobres.
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>

              {/* Project 6 */}
              <div className="group overflow-hidden rounded-lg shadow-md">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/urban-oasis.png"
                    alt="Cobertura Moderna"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 bg-card">
                  <h3 className="text-xl font-bold mb-2">Cobertura Duplex</h3>
                  <p className="text-muted-foreground mb-4">
                    Cobertura de 450m² com terraço panorâmico, spa e decoração contemporânea.
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-center mt-10">
              <Button size="lg">
                Ver Todos os Projetos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="depoimentos" className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">O Que Nossos Clientes Dizem</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A satisfação de nossos clientes é o nosso maior orgulho. Confira alguns depoimentos.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image src="/confident-leader.png" alt="Cliente" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold">Roberto Mendes</h4>
                    <p className="text-sm text-muted-foreground">Empresário</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "A Master Construtora superou todas as minhas expectativas. O projeto foi entregue no prazo e com
                  acabamentos impecáveis. A equipe foi extremamente profissional e atenciosa durante todo o processo."
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-yellow-500"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image src="/confident-leader.png" alt="Cliente" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold">Carla Oliveira</h4>
                    <p className="text-sm text-muted-foreground">Médica</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "Desde o primeiro contato até a entrega das chaves, a Master Construtora demonstrou excelência. O
                  projeto da minha casa ficou exatamente como eu sonhava, com atenção a cada detalhe."
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-yellow-500"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image src="/confident-executive.png" alt="Cliente" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold">Fernando Almeida</h4>
                    <p className="text-sm text-muted-foreground">Advogado</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "Contratar a Master Construtora foi a melhor decisão que tomei. A transparência durante todo o
                  processo e a qualidade do trabalho entregue são incomparáveis. Recomendo sem hesitar."
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-yellow-500"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contato" className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">Entre em Contato</h2>
                <p className="text-muted-foreground mb-8">
                  Estamos prontos para transformar seu sonho em realidade. Entre em contato conosco para agendar uma
                  consulta e discutir seu projeto.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <PhoneCall className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-muted-foreground">(11) 99999-9999</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">contato@masterconstrutora.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-muted-foreground">Av. Paulista, 1000 - São Paulo, SP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Horário de Atendimento</p>
                      <p className="text-muted-foreground">Segunda a Sexta: 8h às 18h</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-bold mb-4">Solicite um Orçamento</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nome Completo
                      </label>
                      <input
                        id="name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="seu.email@exemplo.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Telefone
                      </label>
                      <input
                        id="phone"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="project-type" className="text-sm font-medium">
                        Tipo de Projeto
                      </label>
                      <select
                        id="project-type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="new-construction">Construção Nova</option>
                        <option value="renovation">Reforma</option>
                        <option value="interior-design">Design de Interiores</option>
                        <option value="landscaping">Paisagismo</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Descreva seu projeto..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar Mensagem
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="relative overflow-hidden rounded-lg bg-primary px-6 py-16 sm:px-12 sm:py-24 md:py-32">
              <div className="absolute inset-0 z-0">
                <Image src="/grand-estate-plan.png" alt="Planta de Mansão" fill className="object-cover opacity-10" />
              </div>
              <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
                  Pronto para Construir a Casa dos Seus Sonhos?
                </h2>
                <p className="mt-4 text-lg text-primary-foreground/90">
                  Entre em contato conosco hoje mesmo e transforme sua visão em realidade. Nossa equipe está pronta para
                  criar um projeto exclusivo que atenda a todas as suas necessidades.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" variant="secondary">
                    Agendar Consulta
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Ver Portfólio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/microphone-crowd.png"
                  alt="Master Construtora Logo"
                  width={40}
                  height={40}
                  className="rounded"
                />
                <span className="text-xl font-bold">Master Construtora</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Construindo sonhos com excelência e sofisticação há mais de 20 anos.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#inicio" className="text-muted-foreground hover:text-primary">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="#sobre" className="text-muted-foreground hover:text-primary">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="#servicos" className="text-muted-foreground hover:text-primary">
                    Serviços
                  </Link>
                </li>
                <li>
                  <Link href="#projetos" className="text-muted-foreground hover:text-primary">
                    Projetos
                  </Link>
                </li>
                <li>
                  <Link href="#depoimentos" className="text-muted-foreground hover:text-primary">
                    Depoimentos
                  </Link>
                </li>
                <li>
                  <Link href="#contato" className="text-muted-foreground hover:text-primary">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Serviços</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Projeto Arquitetônico
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Construção Completa
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Design de Interiores
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Paisagismo
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Automação Residencial
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Manutenção e Reforma
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contato</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Av. Paulista, 1000 - São Paulo, SP</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">(11) 99999-9999</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">contato@masterconstrutora.com.br</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Segunda a Sexta: 8h às 18h</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-muted-foreground/20 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Master Construtora. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
