import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Plus, Send, UserPen } from 'lucide-react';

const AddAccountForm = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="bg-[#3e963f] hover:bg-bg-[#3e963f]">
                    <Plus />
                    Add Teachers
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
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">
                            Close
                        </Button>
                    </DialogClose>
                    <Button>
                        <Send className="h-4 w-4 my-auto"/>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddAccountForm