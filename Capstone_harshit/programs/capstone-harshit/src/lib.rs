use anchor_lang::prelude::*;

declare_id!("AKrXLPmj1tW9AzG8EhkmQ7zt2t8FFTVXxsWGjgzrWifg");

pub mod instructions;
pub mod states;

use instructions::*;

#[program]
pub mod capstone_harshit {
    use super::*;

    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        instructions::initialize_treasury::handler(ctx)
    }   

    pub fn initialize(ctx: Context<InitializePool>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    pub fn deposit(ctx: Context<DepositCollateral>, amount: u64) -> Result<()> {
        instructions::deposit_collateral::handler(ctx, amount)
    }
}