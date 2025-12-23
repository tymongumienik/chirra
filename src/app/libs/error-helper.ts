// biome-ignore lint/suspicious/noExplicitAny: no explanation needed :)
export function err(response: any): string {
  return response.error?.value.message || "Something went wrong";
}
