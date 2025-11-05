use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PoolState { 
  pub owner : Pubkey ,
  pub collateral_mint : Pubkey ,
  pub collateral_amount : u64 ,
  pub loan_mint : Pubkey ,
  pub loan_amount : u64 ,
  pub vault_ata : Pubkey ,
  pub interest_rate : u64 ,
  pub last_update_time : i32 ,
  pub bump : u8 ,      // bump of this pda 
}
