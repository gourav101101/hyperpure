import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductDetailClient from './ProductDetailClient';

export function generateStaticParams() {
  return [{ id: 'dummy' }];
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 md:pt-24 pb-20 md:pb-16">
        <ProductDetailClient id={id} />
      </main>
      <Footer />
    </div>
  );
}