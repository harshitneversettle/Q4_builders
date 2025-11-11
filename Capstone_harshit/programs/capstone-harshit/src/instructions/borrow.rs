use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, accessor::amount};
use anchor_spl::associated_token::AssociatedToken;
use crate::states::{PoolState, TreasuryState};



#[derive(Accounts)] 
pub struct BorrowLoan<'info>{

    #[account(mut)]
    pub pool_state : Account<'info , PoolState> ,

    #[account(mut)]
    pub treasury_state : Account<'info , TreasuryState> ,
    
    pub loan_mint : Account<'info , Mint> ,

    #[account(mut)] 
    pub user_ata : Account<'info , TokenAccount> ,

    pub owner : Signer<'info> ,

    #[account(mut)]
    pub treasury_ata: Account<'info , TokenAccount> ,

    /// CHECK: PDA authority for treasury vault 
    #[account(
        seeds = [b"treasury"] ,  
        bump = treasury_state.bump
    )]
    pub treasury_authority : UncheckedAccount<'info> ,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}


pub fn handler(ctx : Context<BorrowLoan>)->Result<()>{
    let treasury = &mut ctx.accounts.treasury_state ;
    let pool = &mut ctx.accounts.pool_state ; 


    
    let amount  = 1 * LAMPORTS_PER_SOL ;

    let bump = treasury.bump;
    let seeds: &[&[u8]] = &[b"treasury", &[bump]];
    let signer_seeds = &[&seeds[..]];

    let transfer_accounts = Transfer{
        from : ctx.accounts.treasury_ata.to_account_info() ,
        to : ctx.accounts.user_ata.to_account_info() ,
        authority : ctx.accounts.treasury_authority.to_account_info()
    } ;

    let cpi_context = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), transfer_accounts, signer_seeds) ;

    token::transfer(cpi_context, amount)?;

    treasury.total_liquidity -= amount ;
    treasury.total_borrowed += amount ;

    

    Ok(())

}