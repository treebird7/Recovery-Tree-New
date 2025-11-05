import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { variantId } = await req.json();

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    // Create checkout URL
    const checkoutUrl = await createCheckoutUrl({
      variantId,
      userId: user.id,
      userEmail: user.email!,
      userName: user.user_metadata?.full_name || user.email!.split('@')[0],
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
