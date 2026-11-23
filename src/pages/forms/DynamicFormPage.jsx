import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SharedSFLayout from "@/pages/forms/school-forms/layouts/shared/SharedSFLayout";
import { GetFormCards } from "@/services/templateService";

const DEFAULT_METRICS = [
    { key: "totalFiles", title: "Total Files", value: 0 },
    { key: "version", title: "Total Templates", value: "0" },
    { key: "lastUpdated", title: "Last Updated", value: "—" },
];

const DynamicFormPage = ({ category }) => {
    const { formCode } = useParams();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const cards = await GetFormCards(category);
                const match = (cards || []).find(
                    (c) => String(c.code).toLowerCase() === String(formCode).toLowerCase()
                );
                if (!active) return;
                if (match) {
                    setCard(match);
                } else {
                    setCard(null);
                    setNotFound(true);
                }
            } catch {
                if (!active) return;
                setCard(null);
                setNotFound(true);
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, [category, formCode]);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading form…
            </div>
        );
    }

    if (notFound || !card) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                Form not found.
            </div>
        );
    }

    return (
        <SharedSFLayout
            formCode={card.code}
            formName={card.name}
            description={card.description || ""}
            metrics={DEFAULT_METRICS}
        />
    );
};

export default DynamicFormPage;
