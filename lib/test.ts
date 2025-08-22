export let isTest = true;
if (process.env.NEXT_PUBLIC_API_URL === "http://localhost:3000") {
  isTest = true;
} else {
  isTest = false;
}
