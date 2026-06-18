import BodyBuildingDetail from "@/components/mantBuild/BodyBuildingDetail";

interface PageProps {
  params: Promise<{ ediId: string }>;
}

export default async function page({ params }: PageProps) {
  const { ediId } = await params;
  return <BodyBuildingDetail ediId={ediId} />;
}
