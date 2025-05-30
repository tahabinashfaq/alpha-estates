import { User } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

export async function setUserRole(user: User, role: "client" | "realtor") {
  const db = getFirestore();
  if (!user.uid) return;
  await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
}

export async function getUserRole(
  user: User
): Promise<"client" | "realtor" | null> {
  const db = getFirestore();
  if (!user.uid) return null;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    return snap.data().role || null;
  }
  return null;
}
