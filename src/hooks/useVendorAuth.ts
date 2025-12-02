import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/types/event';

export const useVendorAuth = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for vendor auth (for now, will migrate to proper auth later)
    const checkAuth = async () => {
      try {
        const authData = localStorage.getItem('vendorAuth');
        if (authData) {
          const parsed = JSON.parse(authData);
          // Verify vendor exists in database
          const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', parsed.id)
            .maybeSingle();
          
          if (data && !error) {
            setVendor({
              id: data.id,
              organizationName: data.organization_name,
              contactPerson: data.contact_person,
              phone: data.phone,
              email: data.email,
              city: data.city,
              registrationDetails: data.registration_details || undefined,
              paymentDetails: data.account_holder_name ? {
                accountHolderName: data.account_holder_name,
                bankName: data.bank_name || '',
                accountNumber: data.account_number || '',
                iban: data.iban || undefined,
                mobileWallet: data.mobile_wallet || undefined,
                paymentMethodType: data.payment_method_type as 'bank' | 'mobile-wallet' | 'both' || 'bank',
              } : undefined,
            });
          } else {
            localStorage.removeItem('vendorAuth');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('vendorAuth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password) // In production, use proper password hashing
      .maybeSingle();

    if (error || !data) {
      throw new Error('Invalid credentials');
    }

    const vendorData: Vendor = {
      id: data.id,
      organizationName: data.organization_name,
      contactPerson: data.contact_person,
      phone: data.phone,
      email: data.email,
      city: data.city,
      registrationDetails: data.registration_details || undefined,
      paymentDetails: data.account_holder_name ? {
        accountHolderName: data.account_holder_name,
        bankName: data.bank_name || '',
        accountNumber: data.account_number || '',
        iban: data.iban || undefined,
        mobileWallet: data.mobile_wallet || undefined,
        paymentMethodType: data.payment_method_type as 'bank' | 'mobile-wallet' | 'both' || 'bank',
      } : undefined,
    };

    localStorage.setItem('vendorAuth', JSON.stringify({ id: data.id }));
    setVendor(vendorData);
    return vendorData;
  };

  const register = async (formData: any) => {
    // Check if vendor already exists
    const { data: existing } = await supabase
      .from('vendors')
      .select('id')
      .eq('email', formData.email)
      .maybeSingle();

    if (existing) {
      throw new Error('Account already exists. Please sign in.');
    }

    const { data, error } = await supabase
      .from('vendors')
      .insert({
        organization_name: formData.organizationName,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        password_hash: formData.password, // In production, use proper password hashing
        city: formData.city,
        registration_details: formData.registrationDetails || null,
        account_holder_name: formData.accountHolderName,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        iban: formData.iban || null,
        mobile_wallet: formData.mobileWallet || null,
        payment_method_type: formData.paymentMethodType,
      })
      .select()
      .single();

    if (error) throw error;

    const vendorData: Vendor = {
      id: data.id,
      organizationName: data.organization_name,
      contactPerson: data.contact_person,
      phone: data.phone,
      email: data.email,
      city: data.city,
      registrationDetails: data.registration_details || undefined,
      paymentDetails: {
        accountHolderName: data.account_holder_name || '',
        bankName: data.bank_name || '',
        accountNumber: data.account_number || '',
        iban: data.iban || undefined,
        mobileWallet: data.mobile_wallet || undefined,
        paymentMethodType: data.payment_method_type as 'bank' | 'mobile-wallet' | 'both' || 'bank',
      },
    };

    localStorage.setItem('vendorAuth', JSON.stringify({ id: data.id }));
    setVendor(vendorData);
    return vendorData;
  };

  const signOut = () => {
    localStorage.removeItem('vendorAuth');
    setVendor(null);
  };

  return { vendor, loading, signIn, register, signOut };
};
