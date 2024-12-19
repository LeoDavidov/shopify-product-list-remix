import React, {useState} from "react";
import {Page, Card, Form, FormLayout, TextField, Button, Frame, Toast, ButtonGroup} from "@shopify/polaris";
import {useFetcher, useNavigate} from "@remix-run/react";
import {createProduct} from "~/utils/shopify.service";

export default function CreateProduct() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [sku, setSku] = useState("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastError, setToastError] = useState<boolean>(false);
    const fetcher = useFetcher();
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        fetcher.submit(
            {
                title,
                price,
                sku,
            },
            {method: "post"}
        );
    };

    React.useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            if (fetcher.data.success) {
                setToastMessage("Product created successfully!");
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
                title="Create Product"
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
                                required
                            />
                            <TextField
                                label="Price"
                                value={price}
                                onChange={setPrice}
                                type="number"
                                autoComplete="off"
                                required
                            />
                            <TextField
                                label="SKU"
                                value={sku}
                                onChange={setSku}
                                autoComplete="off"
                                required
                            />
                            <ButtonGroup>
                                <Button primary submit>
                                    Create Product
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

    const title = formData.get("title") as string;
    const price = formData.get("price") as string;
    const sku = formData.get("sku") as string;

    try {
        await createProduct(title, price, sku);
        return {
            success: true,
            message: "Product created successfully!",
        };
    } catch (error) {
        console.error("Error creating product:", error);
        return {
            success: false,
            message: "Failed to create product. Please try again.",
        };
    }
}
