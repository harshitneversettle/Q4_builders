use::anchor_lang::prelude::* ;
#[account]

#[derive(InitSpace)]
pub struct VaultState {
    pub pool: Pubkey,
    pub bump: u8,
}
