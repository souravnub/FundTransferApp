import { CreditCard } from "lucide-react";

interface BankCardProps {
    username: string;
    accountNumber: string;
}

export function BankCard({ username, accountNumber }: BankCardProps) {
    // Format account number with spaces for readability
    const formattedAccountNumber = accountNumber
        ? accountNumber.match(/.{1,3}/g)?.join(" ") || accountNumber
        : "000 000 000";

    return (
        <div className="relative w-full h-56 rounded-xl overflow-hidden perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-foreground/20 shadow-lg">
                <div className="absolute inset-0 bg-black/5 backdrop-blur-sm"></div>
            </div>

            <div className="relative p-6 h-full flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="text-xs uppercase tracking-wider opacity-80">Secure Bank</div>
                        <div className="text-lg font-bold">Premium Savings Account</div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <CreditCard className="h-6 w-6" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="text-xs uppercase tracking-wider opacity-80">Account Number</div>
                        <div className="font-mono text-lg tracking-wider">{formattedAccountNumber}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs uppercase tracking-wider opacity-80">Account Holder</div>
                        <div className="font-medium text-lg flex items-center space-x-1">
                            <span>{username || "Your Name"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-20 pointer-events-none"></div>
        </div>
    );
}
