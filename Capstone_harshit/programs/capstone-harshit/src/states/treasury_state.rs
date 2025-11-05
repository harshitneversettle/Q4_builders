use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]

pub struct TreasuryState{
    pub liquidity_mint : Pubkey ,    // kya rakha hai treasury me 
    pub treasury_ata : Pubkey ,   // kaha rakha hai 
    pub total_liquidity : u64 ,   // total kitna hai 
    pub total_borrowed : u64 ,    // total me se kitna borrowed hai 
    pub interest_rate : u16 ,
    pub bump : u8 ,
}   