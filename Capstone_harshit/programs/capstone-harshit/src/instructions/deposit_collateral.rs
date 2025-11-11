use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, accessor::amount};
use anchor_spl::associated_token::AssociatedToken;
use crate::states::PoolState;


#[derive(Accounts)]

pub struct DepositCollateral<'info>{
    #[account(mut)]
    pub pool_state: Account<'info, PoolState>,

    #[account(
        seeds = [b"vault", pool_state.key().as_ref()],
        bump 
    )]
    /// CHECK: PDA authority, no data stored
    pub vault_authority: UncheckedAccount<'info>,


    #[account(
        constraint = collateral_mint.key() == pool_state.collateral_mint
    )]
    pub collateral_mint: Account<'info, Mint>,


   #[account(

        init_if_needed,
        payer = owner,
        associated_token::mint = collateral_mint,
        associated_token::authority = vault_authority,
    )]
    pub vault_ata: Account<'info, TokenAccount>,

     #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}


pub fn handler(ctx: Context<DepositCollateral> , amount : u64  ) -> Result<()>{
    let pool = &mut ctx.accounts.pool_state ;

    let transfer_accounts = Transfer{
        from : ctx.accounts.user_ata.to_account_info() ,
        to : ctx.accounts.vault_ata.to_account_info() ,
        authority : ctx.accounts.owner.to_account_info() ,
    } ;

    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info() , transfer_accounts) ;

    token::transfer(cpi_ctx, amount)?;

    pool.collateral_amount += amount ;
    msg!("Deposited: {} tokens into vault {}", amount, ctx.accounts.vault_ata.key());

    Ok(())
}