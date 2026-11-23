"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@repo/auth";
import { seedDemoData } from "../lib/demo/seed";

export default function DemoBootstrap() {
  useEffect(() => {
    seedDemoData();
    getCurrentUser();
  }, []);

  return null;
}
