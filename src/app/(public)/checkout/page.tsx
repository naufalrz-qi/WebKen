import { CheckoutForm } from "./checkout-form"

export default function CheckoutPage() {
  return (
    <main className="mx-auto min-h-[64vh] w-full max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="mb-8 text-3xl font-black tracking-tight text-foreground md:text-4xl">Checkout</h1>
      <CheckoutForm />
    </main>
  )
}
