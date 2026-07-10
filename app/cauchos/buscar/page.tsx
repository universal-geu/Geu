import CauchosCategoryProductsPage from "@/app/components/cauchos-category-products-page";

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function CauchosSearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return <CauchosCategoryProductsPage searchQuery={q} />;
}
