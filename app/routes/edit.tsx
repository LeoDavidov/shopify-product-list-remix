import React, {useState, useEffect} from "react";
import {Page, Card, Form, FormLayout, TextField, Button, Frame, Toast, ButtonGroup} from "@shopify/polaris";
import {useFetcher, useLoaderData, useNavigate} from "@remix-run/react";
import {getProductById, updateProductAndVariantById} from "~/utils/shopify.service";

export const loader = async ({request}: { request: Request }) => {
    try {
        const url = new URL(request.url);
        const productId = url.searchParams.get("id") || null;

        if (!productId) {
            throw new Error("Product ID is missing in the request.");
        }

        const product = await getProductById(productId);

        return {product, productId};
    } catch (error) {
        console.error("Error fetching product:", error);
        throw new Response("Failed to load product. Please try again later.", {
            status: 500,
            statusText: "Internal Server Error",
        });
    }
};

export default function EditProduct() {
    const {product, productId} = useLoaderData();
    const fetcher = useFetcher();
    const navigate = useNavigate();

    const variantId = product.variants[0].id;

    const [title, setTitle] = useState(product.title);
    const [status, setStatus] = useState(product.status);
    const [price, setPrice] = useState(product.variants[0]?.price);
    const [sku, setSku] = useState(product.variants[0]?.sku);

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastError, setToastError] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        fetcher.submit(
            {
                productId,
                variantId,
                title,
                status,
                price,
                sku,
            },
            {method: "post"}
        );
    };

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            if (fetcher.data.success) {
                setToastMessage("Product updated successfully!");
                setToastError(false);
            } else {
                setToastMessage(fetcher.data.message || "An error occurred.");
                setToastError(true);
            }
        }
    }, [fetcher.state, fetcher.data]);

    return (
        <Frame>
            {toastMessage && (
                <Toast
                    content={toastMessage}
                    onDismiss={() => setToastMessage(null)}
                    error={toastError}
                />
            )}
            <Page
                title="Edit Product"
                primaryAction={{
                    content: "Go Back",
                    onAction: () => navigate("/"),
                }}
            >
                <Card sectioned>
                    <Form onSubmit={handleSubmit}>
                        <FormLayout>
                            <TextField
                                label="Title"
                                value={title}
                                onChange={setTitle}
                                autoComplete="off"
                            />
                            <TextField
                                label="Status"
                                value={status}
                                onChange={setStatus}
                                autoComplete="off"
                            />
                            <TextField
                                label="Price"
                                value={price}
                                onChange={setPrice}
                                type="number"
                                autoComplete="off"
                            />
                            <TextField
                                label="SKU"
                                value={sku}
                                onChange={setSku}
                                autoComplete="off"
                            />
                            <ButtonGroup>
                                <Button primary submit>
                                    Save Changes
                                </Button>
                                <Button onClick={() => navigate("/")}>Go Back</Button>
                            </ButtonGroup>
                        </FormLayout>
                    </Form>
                </Card>
            </Page>
        </Frame>
    );
}

export async function action({request}: { request: Request }) {
    const formData = await request.formData();

    const productId = formData.get("productId");
    const variantId = formData.get("variantId");
    const title = formData.get("title");
    const status = formData.get("status");
    const price = formData.get("price");
    const sku = formData.get("sku");

    try {
        await updateProductAndVariantById(
            productId,
            {title, status},
            variantId,
            {price, sku}
        );

        return {
            success: true,
            message: "Product updated successfully!",
        };
    } catch (error) {
        console.error("Error updating product:", error);
        return {
            success: false,
            message: "Failed to update product. Please try again.",
        };
    }
}
