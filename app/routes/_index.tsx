import {
    Card,
    Page,
    DataTable,
    Pagination,
    Button,
    BlockStack,
    Spinner,
} from "@shopify/polaris";
import { useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import { fetchProd } from "~/utils/shopify.service";

export const loader = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor") || null;
    const direction = url.searchParams.get("direction") || "next";
    const pageSize = 5;

    return await fetchProd(cursor, pageSize, direction as "next" | "previous");
};

export default function Index() {
    const { products, hasNext, hasPrevious, nextCursor, previousCursor } =
        useLoaderData();
    const navigate = useNavigate();
    const navigation = useNavigation();

    const handlePagination = (direction: "next" | "previous"): void => {
        const cursor = direction === "next" ? nextCursor : previousCursor;

        if (!cursor) return;

        navigate(`/?cursor=${cursor}&direction=${direction}`);
    };

    if (navigation.state === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner accessibilityLabel="Loading products" size="large" />
            </div>
        );
    }

    const rows = products.map((product) => [
        product.title,
        product.status,
        product.variantPrice,
        product.variantSku,
        <Button key={product.id} onClick={() => navigate(`/edit?id=${product.id}`)}>
            Edit
        </Button>,
    ]);

    return (
        <Page title="Products">
            <BlockStack align="space-evenly">
                <Button variant="primary" onClick={() => navigate("/create")}>
                    Create Product
                </Button>
            </BlockStack>
            <Card>
                <DataTable
                    columnContentTypes={[
                        "text",
                        "text",
                        "numeric",
                        "text",
                        "text",
                    ]}
                    headings={["Title", "Status", "Variant Price", "Variant SKU", "Actions"]}
                    rows={rows}
                />
            </Card>
            <Pagination
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onNext={() => handlePagination("next")}
                onPrevious={() => handlePagination("previous")}
            />
        </Page>
    );
}
