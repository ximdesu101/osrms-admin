import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs";
import SchoolForms from "./school-forms/SchoolForms";
import AdministrativeForms from "./administrative-forms/AdministrativeForms";

const Forms = () => {
    return (
        <Tabs defaultValue="school-forms">
            <TabsList className="w-full">
                <TabsTrigger value="school-forms">
                    School Forms
                </TabsTrigger>
                <TabsTrigger value="admin-forms">
                    Administrative Forms
                </TabsTrigger>
            </TabsList>

            <TabsContent value="school-forms">
                <SchoolForms />
            </TabsContent>
            <TabsContent value="admin-forms">
                <AdministrativeForms />
            </TabsContent>
        </Tabs>
    )
}

export default Forms
