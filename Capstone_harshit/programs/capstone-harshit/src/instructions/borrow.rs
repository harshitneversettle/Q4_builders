use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, accessor::amount};
use anchor_spl::associated_token::AssociatedToken;
use crate::states::PoolState;


#[derive(Accounts)] 
pub struct BorrowLoan<'info>{

    #[account(mut)]
    pub pool_state : Account<'info , PoolState> ,

    pub loan_mint : Account<'info , Mint> ,

    #[account(mut)] 
    pub user_ata : Account<'info , TokenAccount> ,
    

    

}