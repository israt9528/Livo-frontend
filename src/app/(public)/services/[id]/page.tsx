import { PropertyDetailView } from "@/components/properties/PropertyDetailView";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyDetailView propertyId={id} />;
}
