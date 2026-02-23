import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://qxennisguwsphtpmcout.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4ZW5uaXNndXdzcGh0cG1jb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODM3NzEsImV4cCI6MjA4Njk1OTc3MX0.2K811N6yReg_4TCTJg_j_jal1dYHEgMRf13o98obHm4'
);

async function test() {
    const storeId = 'newauth';
    const { data: store, error: storeError } = await supabase.from('stores').select('*').eq('id', storeId).single();
    console.log('Store "newauth":', store);

    const storeId2 = 'naredra-rice-mill';
    const { data: store2, error: storeError2 } = await supabase.from('stores').select('*').eq('id', storeId2).single();
    console.log('Store "naredra-rice-mill":', store2);

}

test();
