use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]

pub struct UserTreasury{
    pub user : Pubkey ,
    pub treasury: Pubkey,            // main treasury --> for security 
    pub liquidity_mint : Pubkey ,    // kya rakha raha hai treasury me 
    pub treasury_ata : Pubkey ,   // kaha rakha hai 
    pub deposit_amount : u64 ,   // kitna rakh raha hai 
    pub deposit_time : i64 ,    // kb rakh raha hai --> for interest 
    pub bump : u8 ,
}   