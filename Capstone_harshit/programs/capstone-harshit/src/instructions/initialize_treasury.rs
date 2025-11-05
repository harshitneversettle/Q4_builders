use anchor_lang::{context, prelude::*};
use anchor_spl::{
    token::{Mint, TokenAccount, Token},
    associated_token::AssociatedToken,
};

use crate::states::TreasuryState;

#[derive(Accounts)]

pub struct InitializeTreasury<'info> {

    #[account(
        init ,
        payer = owner ,
        space = 8 + TreasuryState::INIT_SPACE ,
        seeds = [b"treasury"] ,      // owner.key().as_ref() nahi chalega because i only need one treasury for all 
        bump ,
    )]
    pub treasury_state : Account<'info , TreasuryState> ,

    #[account(mut)]
    pub owner : Signer<'info> ,


    #[account(
        init_if_needed , 
        payer = owner , 
        associated_token::mint = liquidity_mint ,
        associated_token::authority = treasury_state 
    )]
    pub treasury_vault : Account<'info , TokenAccount> ,     // ATA for treasurypda 

    pub liquidity_mint : Account<'info , Mint> ,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
}


pub fn handler(ctx : Context<InitializeTreasury>)->Result<()>{
    let treasury = &mut ctx.accounts.treasury_state ;

    treasury.liquidity_mint = ctx.accounts.liquidity_mint.key() ;
    treasury.total_liquidity = 0 ;
    treasury.total_borrowed = 0 ;
    treasury.interest_rate = 500 ;
    treasury.bump = ctx.bumps.treasury_state ;
    treasury.treasury_ata = ctx.accounts.treasury_vault.key() ;

    msg!("✅ Treasury initialized successfully ✅");
    Ok(())
}