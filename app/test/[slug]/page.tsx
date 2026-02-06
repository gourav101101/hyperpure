export async function generateStaticParams() {
  return [{ slug: 'a' }];
}

export default function TestSlug({ params }: { params: { slug: string } }) {
  return <div>Test {params.slug}</div>;
}
