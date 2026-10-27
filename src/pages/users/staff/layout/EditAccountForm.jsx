import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
} from "@/components/ui/field"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, UserPen, SquarePen } from 'lucide-react';

const EditAccountForm = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                >
                    <SquarePen />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add Teacher Account
                    </DialogTitle>
                    <DialogDescription>
                        Add a mother fucker teacher
                    </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                    <FieldGroup className="grid grid-cols-2">
                        <Field>
                            <FieldLabel>First Name</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="first-name"
                                    required
                                />
                                <InputGroupAddon><UserPen /></InputGroupAddon>
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel>Middle Name</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="middle-name"
                                    required
                                />
                                <InputGroupAddon><UserPen /></InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </FieldGroup>

                    <FieldGroup className="grid grid-cols-2">
                        <Field>
                            <FieldLabel>Last Name</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="last-name"
                                    required
                                />
                                <InputGroupAddon><UserPen /></InputGroupAddon>
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel>Suffix</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="suffix"
                                    required
                                />
                                <InputGroupAddon><UserPen /></InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </FieldGroup>
                    <Field>
                        <FieldLabel>Username</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="username"
                                required
                            />
                            <InputGroupAddon><UserPen /></InputGroupAddon>
                        </InputGroup>
                    </Field>
                    <Field>
                        <FieldLabel>Email Address</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="email"
                                type="email"
                                required
                            />
                            <InputGroupAddon><UserPen /></InputGroupAddon>
                        </InputGroup>
                    </Field>
                    <FieldGroup className="grid grid-cols-2">
                        <Field>
                            <FieldLabel>Password</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="password"
                                    type="password"
                                    required
                                />
                                <InputGroupAddon><UserPen /></InputGroupAddon>
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel>Confirm Password</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="confirm-password"
                                    type="password"
                                    required
                                />
                                <InputGroupAddon><UserPen /></InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </FieldGroup>
                </FieldGroup>
            </DialogContent>
        </Dialog>
    )
}

export default EditAccountForm