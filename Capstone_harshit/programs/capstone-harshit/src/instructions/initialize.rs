use anchor_lang::prelude::*;
use anchor_spl::token::Mint; 
use crate::states::PoolState;


#[derive(Accounts)]
pub struct InitializePool<'info> {
  #[account(
    init , 
    payer = owner ,
    space = 8 + PoolState::INIT_SPACE ,
    seeds = [b"user-pool" , owner.key().as_ref()] ,
    bump ,
  )]
  pub pool_state : Account<'info , PoolState> ,

  #[account(mut)]
  pub owner : Signer<'info> ,

  pub collateral_mint : Account<'info,Mint> ,
  pub loan_mint : Account<'info , Mint> ,
  pub system_program: Program<'info, System>,
}


pub fn handler(ctx: Context<InitializePool>)->Result<()>{
    let pool = &mut ctx.accounts.pool_state ;

    pool.owner = ctx.accounts.owner.key() ;
    pool.collateral_mint = ctx.accounts.collateral_mint.key() ;
    pool.collateral_amount = 0 ;
    pool.loan_mint = ctx.accounts.loan_mint.key();
    pool.loan_amount = 0 ;
    pool.vault_ata = Pubkey::default() ;
    pool.bump = ctx.bumps.pool_state ;
    pool.interest_rate = 500 ;     // 5%
    pool.last_update_time = 0 ;
    msg!(" Personal pool initialized for user: {}", pool.owner);
    Ok(())
}
