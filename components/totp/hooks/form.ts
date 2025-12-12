import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createFormHookContexts, createFormHook } from "@tanstack/react-form"


const { fieldContext, formContext } = createFormHookContexts()

// Allow us to bind components to the form to keep type safety but reduce production boilerplate
// Define this once to have a generator of consistent form instances throughout your app
export const { useAppForm } = createFormHook({
    fieldComponents: {
        Input,
        Label,
        Button,
    },
    formComponents: {
        Button,
    },
    fieldContext,
    formContext,
})
