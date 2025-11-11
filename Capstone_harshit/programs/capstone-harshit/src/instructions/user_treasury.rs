use anchor_lang::{prelude::*};
use anchor_spl::{
    associated_token::AssociatedToken, token::{self, Mint, Token, TokenAccount}
};
use anchor_spl::token::Transfer;
use crate::states::{UserTreasury, treasury_state};
use crate::states::TreasuryState;


#[derive(Accounts)]
pub struct UserDeposit<'info>{
   #[account(
        mut,
        has_one = liquidity_mint,
        seeds = [b"treasury"],
        bump = treasury_state.bump
    )]
    pub treasury_state : Account<'info , TreasuryState> ,

    #[account(
        init_if_needed,
        payer = user ,
        space = 8 + UserTreasury::INIT_SPACE,
        seeds = [b"user-deposit" , user.key().as_ref()] ,
        bump ,
    )]
    pub user_treasury : Account<'info ,UserTreasury> ,

    /// CHECK: PDA authority for treasury vault
    #[account(
        seeds = [b"treasury"],
        bump = treasury_state.bump  
    )]
    pub treasury_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub user : Signer<'info> , 

    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>,

    
    /// CHECK: WSOL native mint (do NOT deserialize as Mint!)
    pub liquidity_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub treasury_ata : Account<'info , TokenAccount> ,

    
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
}



pub fn handler(ctx : Context<UserDeposit> , amount : u64)->Result<()> {
    let user = &mut ctx.accounts.user_treasury ;
    let treasury = &mut ctx.accounts.treasury_state ;

    user.user = ctx.accounts.user.key() ;
    user.treasury = treasury.key();
    user.liquidity_mint = ctx.accounts.liquidity_mint.key() ;
    user.treasury_ata = ctx.accounts.treasury_ata.key() ;
    user.deposit_amount = amount ;
    user.deposit_time = Clock::get()?.unix_timestamp ;

    let transfer_accounts = Transfer{
        from : ctx.accounts.user_ata.to_account_info() ,
        to : ctx.accounts.treasury_ata.to_account_info() ,
        authority : ctx.accounts.user.to_account_info() ,
    };

    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_accounts) ;

    token::transfer(cpi_context, amount)?;

    treasury.total_liquidity += amount ;

    msg!(
        "User {} deposited {} tokens successfully!",
        user.user,
        amount
    );

    Ok(())

}