export function generateStaticParams() {
  return [{ id: 'dummy' }];
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Blog {params.id}</h1>
    </div>
  );
}