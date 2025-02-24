import { Stripe, loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with the publishable key passed from the server
const stripePromise = loadStripe((window as any).publishableKey);

const paymentForm = document.getElementById("payment-form") as HTMLFormElement;
const messageElement = document.getElementById(
  "payment-message"
) as HTMLElement;

paymentForm.addEventListener("submit", async (e: Event) => {
  e.preventDefault();

  try {
    // Fetch the Payment Intent Client Secret
    const response = await fetch("/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 1000, // Example: $10.00
        currency: "usd",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create payment intent");
    }

    const { clientSecret } = await response.json();

    // Load the Stripe instance
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error("Stripe could not be loaded");
    }

    // Create a Stripe Card Element
    const elements = stripe.elements();
    const card = elements.create("card");
    card.mount("#card-element");

    // Confirm the Payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: card,
          billing_details: {
            name: "Test User", // Replace with actual user data if needed
          },
        },
      }
    );

    // Handle success or error
    if (error) {
      messageElement.textContent = `Payment failed: ${error.message}`;
    } else if (paymentIntent?.status === "succeeded") {
      messageElement.textContent = "Payment successful!";
    }
  } catch (error: any) {
    messageElement.textContent = `An error occurred: ${error.message}`;
  }
});
