import CauchosCategoryProductsPage from "@/app/components/cauchos-category-products-page";

type Props = {
  params: Promise<{
    segments: string[];
  }>;
};

export default async function ImportCategoryPage({ params }: Props) {
  const { segments } = await params;

  return <CauchosCategoryProductsPage segments={segments} division="Import" />;
}
