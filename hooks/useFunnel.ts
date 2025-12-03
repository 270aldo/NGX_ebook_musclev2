import { useState } from 'react';

// You should add VITE_N8N_WEBHOOK_URL to your .env file
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/ngx-funnel';

interface FunnelEventData {
    action: string;
    label?: string;
    value?: string | number;
    userId?: string; // If we have a user ID
    timestamp?: string;
}

export const useFunnel = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const triggerWebhook = async (eventData: FunnelEventData) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...eventData,
                timestamp: new Date().toISOString(),
                source: 'ngx_ultimate_book_v2'
            };

            // Using fetch with 'no-cors' mode if n8n doesn't support CORS, 
            // but ideally n8n should be configured to allow CORS from the app domain.
            // If we need the response, we must ensure CORS is set up correctly on n8n.
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('Funnel event triggered:', payload);
            return true;
        } catch (error) {
            console.error('Error triggering funnel webhook:', error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        triggerWebhook,
        isSubmitting
    };
};
