import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { GitBranch, Upload } from "lucide-react";

/**
 * @param {{
 *   formCode: string,
 *   formName?: string
 * }} props
 */
const SharedUploadVersion = ({ formCode, formName }) => {
    const title = formName ? `Upload ${formCode} Form` : `Upload ${formCode} Form`;
    const description = formName
        ? `Add a new copy of the ${formCode} ${formName} to the system.`
        : `Add a new copy of the ${formCode} school form to the system.`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Upload />
                    Upload Form
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Separator />
                <FieldGroup>
                    <FieldGroup className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="sy">School Year</FieldLabel>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select school year" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectItem value="1">2026-2027</SelectItem>
                                        <SelectItem value="2">2025-2026</SelectItem>
                                        <SelectItem value="3">2024-2025</SelectItem>
                                        <SelectItem value="4">2023-2024</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="version">Version</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="version"
                                    type="text"
                                    placeholder="v3"
                                    required
                                />
                                <InputGroupAddon>
                                    <GitBranch />
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </FieldGroup>
                    <Field>
                        <Empty className="border border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Upload />
                                </EmptyMedia>
                                <EmptyTitle>Upload {formCode} File</EmptyTitle>
                                <EmptyDescription>
                                    Drag and drop or browse to select a file.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button>Browse File</Button>
                            </EmptyContent>
                        </Empty>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="note">Description / Notes</FieldLabel>
                        <InputGroup>
                            <InputGroupTextarea id="note" type="text" />
                        </InputGroup>
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button variant="default">
                        <Upload />
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SharedUploadVersion;