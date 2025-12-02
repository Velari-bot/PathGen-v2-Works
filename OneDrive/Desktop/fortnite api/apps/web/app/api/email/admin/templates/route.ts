// PathGen Email API — Admin Templates Endpoint

import { NextRequest, NextResponse } from "next/server";
import { admin, db } from "../../../../../lib/firebase-admin";

/**
 * GET /api/email/admin/templates
 * Get all email templates (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (!userData?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all templates from Firestore
    const templatesSnapshot = await db.collection("emailTemplates").get();

    const templates: Array<{
      name: string;
      updatedAt: admin.firestore.Timestamp | null;
    }> = [];

    templatesSnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({
        name: doc.id,
        updatedAt: data.updatedAt || null,
      });
    });

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error: any) {
    console.error("[EMAIL] Get templates API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

