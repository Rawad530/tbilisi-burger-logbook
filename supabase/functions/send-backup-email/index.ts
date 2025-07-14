import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackupEmailRequest {
  orders: any[];
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orders, email }: BackupEmailRequest = await req.json();

    if (!orders || !email) {
      throw new Error("Orders and email are required");
    }

    // Helper function to parse item details (same as frontend)
    const parseItemDetails = (itemName: string) => {
      const isBurgerOrWrap = itemName.toLowerCase().includes('burger') || itemName.toLowerCase().includes('wrap');
      
      if (!isBurgerOrWrap) {
        return {
          mainItem: itemName,
          protein: 'N/A',
          load: 'N/A',
          type: 'N/A'
        };
      }
      
      const isWrap = itemName.toLowerCase().includes('wrap');
      const mainItem = isWrap ? 'Wrap' : 'Burger';
      
      const isChicken = itemName.toLowerCase().includes('chicken');
      const isBeef = itemName.toLowerCase().includes('beef');
      const protein = isChicken ? 'Chicken' : isBeef ? 'Beef' : 'N/A';
      
      const isDouble = itemName.toLowerCase().includes('double');
      const load = isDouble ? 'Double' : 'Single';
      
      const isCombo = itemName.toLowerCase().includes('combo');
      const type = isCombo ? 'Combo' : 'A la carte';
      
      return { mainItem, protein, load, type };
    };

    // Generate HTML table rows
    const tableRows = orders.flatMap(order =>
      order.items.map(item => {
        const { mainItem, protein, load, type } = parseItemDetails(item.menuItem.name);
        const addons = Array.isArray(item.addons) ? [...item.addons] : [];
        if (item.spicy) addons.push('Spicy');
        
        return `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${order.orderNumber}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(order.timestamp).toLocaleString('en-GB')}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${mainItem}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${protein}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${load}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${type}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.sauce || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${type === 'Combo' ? (item.drink || 'N/A') : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${type === 'Combo' ? (item.sauceCup || 'N/A') : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${addons.length > 0 ? addons.join(', ') : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.remarks || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₾${(item.menuItem.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      })
    ).join('');

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Generate HTML email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Saucer Burger - Orders Backup</h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #555;">Backup Summary</h3>
          <p style="margin: 5px 0;"><strong>Total Orders:</strong> ${orders.length}</p>
          <p style="margin: 5px 0;"><strong>Total Items:</strong> ${totalItems}</p>
          <p style="margin: 5px 0;"><strong>Total Revenue:</strong> ₾${totalRevenue.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Backup Date:</strong> ${new Date().toLocaleString('en-GB')}</p>
        </div>

        <table style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 12px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Order ID</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Order Timestamp</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Main Item</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Protein</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Load</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Type</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Sauce</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Drink</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Side Sauce</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Add Ons</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Remarks</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Price (GEL)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p style="margin: 0; color: #666; font-size: 14px;">Generated by Saucer Burger Management System</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Saucer Burger <onboarding@resend.dev>",
      to: [email],
      subject: `Saucer Burger - Orders Backup ${new Date().toLocaleDateString('en-GB')}`,
      html: htmlContent,
    });

    console.log("Backup email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-backup-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);