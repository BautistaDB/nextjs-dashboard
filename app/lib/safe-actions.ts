// app/lib/safe-action.ts
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE} from "next-safe-action";
import { auth } from "@/auth";

class ActionError extends Error {}

export const action = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) return e.message;
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(async ({ next }) => {
  const session = await auth();

  if (!session?.user) {
    throw new ActionError("UNAUTHORIZED");
  }
  return next({ ctx: { userId: session.user.id } });
});
